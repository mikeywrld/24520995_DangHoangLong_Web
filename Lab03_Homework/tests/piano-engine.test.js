import { describe, expect, it, vi } from 'vitest';
import {
  BLACK_KEY_COUNT, PIANO_KEYS, WHITE_KEY_COUNT, generatePianoKeys, midiToFreq,
} from '../src/homeworks/GrandPiano88/pianoMath.js';
import { FifoQueue } from '../src/homeworks/GrandPiano88/fifoQueue.js';
import { NoteRecorder } from '../src/homeworks/GrandPiano88/NoteRecorder.js';
import { replay } from '../src/homeworks/GrandPiano88/replay.js';
import { PolyphonicSynth } from '../src/audio/PolyphonicSynth.js';
import { makeAudioMock } from './helpers/audioMock.js';

describe('HW2 – algorithmic 88-key generation', () => {
  it('generates exactly 88 keys = 52 white + 36 black, A0..C8', () => {
    expect(PIANO_KEYS).toHaveLength(88);
    expect(WHITE_KEY_COUNT).toBe(52);
    expect(BLACK_KEY_COUNT).toBe(36);
    expect(PIANO_KEYS[0].noteName).toBe('A0');
    expect(PIANO_KEYS.at(-1).noteName).toBe('C8');
    expect(new Set(PIANO_KEYS.map((k) => k.octave)).size).toBe(9); // octaves 0..8 (7+ full octaves)
  });
  it('uses f = 440 * 2^((midi-69)/12)', () => {
    expect(midiToFreq(69)).toBe(440);
    expect(midiToFreq(21)).toBeCloseTo(27.5, 6);
    expect(midiToFreq(60)).toBeCloseTo(261.6256, 3);
    expect(midiToFreq(108)).toBeCloseTo(4186.009, 2);
    expect(midiToFreq(81)).toBeCloseTo(880, 6); // +12 semitones doubles
  });
  it('places black keys between the right white keys (slot = whites before it)', () => {
    const c4 = PIANO_KEYS.find((k) => k.midi === 60);
    const cs4 = PIANO_KEYS.find((k) => k.midi === 61);
    const d4 = PIANO_KEYS.find((k) => k.midi === 62);
    expect(cs4.isBlack).toBe(true);
    expect(cs4.slot).toBe(c4.slot + 1);
    expect(d4.slot).toBe(c4.slot + 1);
  });
  it('is not hard-coded: a sub-range generator works', () => {
    expect(generatePianoKeys(60, 71)).toHaveLength(12);
  });
});

describe('FifoQueue', () => {
  it('dequeues in insertion order and reports size', () => {
    const q = FifoQueue.from([1, 2, 3]);
    expect(q.size).toBe(3);
    expect(q.dequeue()).toBe(1);
    expect(q.peek()).toBe(2);
    expect(q.toArray()).toEqual([2, 3]);
    q.dequeue(); q.dequeue();
    expect(q.dequeue()).toBeUndefined();
    expect(q.size).toBe(0);
  });
  it('compacts after many dequeues without losing items', () => {
    const q = new FifoQueue();
    for (let i = 0; i < 100; i += 1) q.enqueue(i);
    for (let i = 0; i < 70; i += 1) q.dequeue();
    expect(q.toArray()[0]).toBe(70);
    expect(q.size).toBe(30);
  });
});

describe('PolyphonicSynth – 8 voices + FIFO voice stealing', () => {
  it('steals the OLDEST voice on the 9th concurrent note', () => {
    const { AudioCtor, created } = makeAudioMock();
    const stolen = vi.fn();
    const synth = new PolyphonicSynth(8, { AudioCtor, onVoiceStolen: stolen });
    for (let midi = 60; midi < 69; midi += 1) synth.noteOn(midi, midiToFreq(midi)); // 9 notes
    expect(synth.activeCount).toBe(8);
    expect(stolen).toHaveBeenCalledTimes(1);
    expect(stolen).toHaveBeenCalledWith(60);
    expect(synth.activeMidis()).toEqual([61, 62, 63, 64, 65, 66, 67, 68]);
    expect(created.oscillators).toHaveLength(9);
  });
  it('ramps gain to silence BEFORE osc.stop (click-free) and disconnects on end', () => {
    const { AudioCtor, created } = makeAudioMock();
    const synth = new PolyphonicSynth(8, { AudioCtor });
    synth.noteOn(69, 440);
    synth.noteOff(69);
    const osc = created.oscillators[0];
    const gain = created.gains.find((g) => g.gain.calls.some(([k, v]) => k === 'ramp' && v === 0.0001));
    expect(gain).toBeDefined();
    const ramp = gain.gain.calls.filter(([k]) => k === 'ramp').at(-1);
    expect(ramp[2]).toBeCloseTo(0.04, 5);           // 40 ms release ramp
    expect(osc.stoppedAt).toBeGreaterThan(ramp[2]); // stop only after the ramp ends
    osc.onended();
    expect(osc.disconnected).toBe(true);
  });
  it('ignores a duplicate noteOn and dispose() closes the context', () => {
    const { AudioCtor, created } = makeAudioMock();
    const synth = new PolyphonicSynth(8, { AudioCtor });
    expect(synth.noteOn(60, 261.6)).toBe(true);
    expect(synth.noteOn(60, 261.6)).toBe(false);
    synth.dispose();
    expect(synth.activeCount).toBe(0);
    expect(created.contexts[0].closed).toBe(true);
  });
});

describe('NoteRecorder', () => {
  it('records { midi, freqHz, durationMs, deltaMs } ordered by onset into a FIFO queue', () => {
    const rec = new NoteRecorder();
    rec.start(1000);
    rec.noteOn(60, 261.6, 1100);
    rec.noteOn(64, 329.6, 1300);
    rec.noteOff(64, 1500);
    rec.noteOff(60, 1700);
    const q = rec.stop(1800);
    expect(q.toArray()).toEqual([
      { midi: 60, freqHz: 261.6, durationMs: 600, deltaMs: 0 },
      { midi: 64, freqHz: 329.6, durationMs: 200, deltaMs: 200 },
    ]);
  });
  it('finalises notes still held when recording stops', () => {
    const rec = new NoteRecorder();
    rec.start(0);
    rec.noteOn(60, 261.6, 50);
    const q = rec.stop(450);
    expect(q.toArray()).toEqual([{ midi: 60, freqHz: 261.6, durationMs: 400, deltaMs: 0 }]);
  });
});

describe('replay – async FIFO playback with AbortController', () => {
  const makeSynth = () => {
    const calls = [];
    const t0 = Date.now();
    return {
      calls,
      noteOn: (m) => calls.push(['on', m, Date.now() - t0]),
      noteOff: (m) => calls.push(['off', m, Date.now() - t0]),
      allNotesOff: vi.fn(),
    };
  };
  const queue = () => FifoQueue.from([
    { midi: 60, freqHz: 261.6, durationMs: 400, deltaMs: 0 },
    { midi: 64, freqHz: 329.6, durationMs: 200, deltaMs: 200 },
  ]);

  it('replays at 2x speed: deltas and durations are halved', async () => {
    vi.useFakeTimers();
    const synth = makeSynth();
    const done = replay(queue(), { speed: 2, synth });
    await vi.advanceTimersByTimeAsync(1000);
    await done;
    expect(synth.calls).toEqual([['on', 60, 0], ['on', 64, 100], ['off', 60, 200], ['off', 64, 200]]);
    vi.useRealTimers();
  });
  it('Stop sequence: abort rejects with AbortError, silences voices and leaves 0 timers', async () => {
    vi.useFakeTimers();
    const synth = makeSynth();
    const controller = new AbortController();
    const outcome = replay(queue(), { speed: 1, synth, signal: controller.signal }).then(() => 'finished', (e) => e.name);
    await vi.advanceTimersByTimeAsync(150); // note 60 sounding, note 64 not yet started
    controller.abort();
    expect(await outcome).toBe('AbortError');
    expect(synth.allNotesOff).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    const before = synth.calls.length;
    await vi.advanceTimersByTimeAsync(5000);
    expect(synth.calls.length).toBe(before); // nothing scheduled survives the abort
    vi.useRealTimers();
  });
});
