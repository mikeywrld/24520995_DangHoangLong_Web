import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandPiano88 } from '../src/homeworks/GrandPiano88/GrandPiano88.jsx';
import { PolyphonicSynth } from '../src/audio/PolyphonicSynth.js';
import { renderProbe } from '../src/lib/renderProbe.js';
import { makeAudioMock } from './helpers/audioMock.js';

const keyBtn = (midi) => document.querySelector(`[data-midi="${midi}"]`);
const fakeSynth = () => ({ noteOn: vi.fn(), noteOff: vi.fn(), allNotesOff: vi.fn(), dispose: vi.fn() });

describe('HW2 UI – React.memo render isolation (what the Profiler shows)', () => {
  beforeEach(() => renderProbe.enable());
  afterEach(() => renderProbe.disable());

  it('mount renders all 88 keys once; pressing ONE key re-renders ONLY that key', () => {
    render(<GrandPiano88 createSynth={fakeSynth} />);
    expect(document.querySelectorAll('[data-midi]')).toHaveLength(88);
    expect(renderProbe.total()).toBe(88);

    renderProbe.reset();
    fireEvent.pointerDown(keyBtn(60));
    expect(renderProbe.total()).toBe(1);
    expect(renderProbe.get(60)).toBe(1);
    expect(keyBtn(60)).toHaveAttribute('aria-pressed', 'true');

    renderProbe.reset();
    fireEvent.pointerUp(keyBtn(60));
    expect(renderProbe.total()).toBe(1);
    expect(keyBtn(60)).toHaveAttribute('aria-pressed', 'false');
  });

  it('releasing a key that is not pressed renders nothing (state bail-out)', () => {
    render(<GrandPiano88 createSynth={fakeSynth} />);
    renderProbe.reset();
    fireEvent.pointerUp(keyBtn(70));
    expect(renderProbe.total()).toBe(0);
  });
});

describe('HW2 UI – polyphony & a11y', () => {
  it('9th simultaneous key steals the oldest voice and un-presses it', () => {
    const { AudioCtor } = makeAudioMock();
    const createSynth = (opts) => new PolyphonicSynth(8, { ...opts, AudioCtor });
    render(<GrandPiano88 createSynth={createSynth} />);
    for (let midi = 60; midi <= 68; midi += 1) fireEvent.pointerDown(keyBtn(midi));
    expect(screen.getByText(/Active voices: 8 \/ 8/)).toBeInTheDocument();
    expect(keyBtn(60)).toHaveAttribute('aria-pressed', 'false'); // stolen
    expect(keyBtn(68)).toHaveAttribute('aria-pressed', 'true');
  });

  it('exposes a single tab stop (roving tabindex) and arrows move focus', () => {
    render(<GrandPiano88 createSynth={fakeSynth} />);
    const tabbable = () => [...document.querySelectorAll('[data-midi]')].filter((b) => b.tabIndex === 0);
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0].dataset.midi).toBe('60');
    act(() => keyBtn(60).focus());
    fireEvent.keyDown(keyBtn(60), { key: 'ArrowRight' });
    expect(document.activeElement.dataset.midi).toBe('61');
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0].dataset.midi).toBe('61');
  });

  it('computer keyboard (e.code) plays notes but is ignored while typing in the speed select', () => {
    const synth = fakeSynth();
    render(<GrandPiano88 createSynth={() => synth} />);
    fireEvent.keyDown(window, { code: 'KeyA' }); // C4
    expect(synth.noteOn).toHaveBeenCalledWith(60, expect.closeTo(261.6256, 3));
    fireEvent.keyUp(window, { code: 'KeyA' });
    expect(synth.noteOff).toHaveBeenCalledWith(60);
    synth.noteOn.mockClear();
    fireEvent.keyDown(within(document.body).getByLabelText('Replay speed'), { code: 'KeyS' });
    expect(synth.noteOn).not.toHaveBeenCalled();
  });

  it('record → stop → play → stop sequence wires the FIFO recorder and abortable replay', async () => {
    vi.useFakeTimers();
    const synth = fakeSynth();
    render(<GrandPiano88 createSynth={() => synth} />);
    fireEvent.click(screen.getByRole('button', { name: 'Record' }));
    fireEvent.pointerDown(keyBtn(60));
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    fireEvent.pointerUp(keyBtn(60));
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
    expect(screen.getByText('1 note recorded')).toBeInTheDocument();

    synth.noteOn.mockClear();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Play sequence' })); await vi.advanceTimersByTimeAsync(0); });
    expect(synth.noteOn).toHaveBeenCalledTimes(1);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Stop sequence' })); await vi.advanceTimersByTimeAsync(10); });
    expect(synth.allNotesOff).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
