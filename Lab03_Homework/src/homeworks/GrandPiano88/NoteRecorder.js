import { FifoQueue } from './fifoQueue.js';

/**
 * Records played notes as { midi, freqHz, durationMs, deltaMs } in a FIFO queue.
 * deltaMs = time since the PREVIOUS note-on (0 for the first) so replay can sleep(delta / speed).
 * Clock is injected => deterministic tests.
 */
export class NoteRecorder {
  constructor() {
    this.isRecording = false;
    this._t0 = 0;
    this._pending = new Map(); // midi -> { startMs, freqHz }
    this._done = [];
  }

  start(nowMs) {
    this.isRecording = true;
    this._t0 = nowMs;
    this._pending.clear();
    this._done = [];
  }

  noteOn(midi, freqHz, nowMs) {
    if (!this.isRecording || this._pending.has(midi)) return;
    this._pending.set(midi, { startMs: nowMs - this._t0, freqHz });
  }

  noteOff(midi, nowMs) {
    const p = this._pending.get(midi);
    if (!this.isRecording || !p) return;
    this._pending.delete(midi);
    this._done.push({ midi, freqHz: p.freqHz, startMs: p.startMs, durationMs: Math.max(1, nowMs - this._t0 - p.startMs) });
  }

  /** Finalise held notes, order by onset, convert onsets to deltas, return a FIFO queue. */
  stop(nowMs) {
    if (this.isRecording) {
      for (const midi of [...this._pending.keys()]) this.noteOff(midi, nowMs);
    }
    this.isRecording = false;
    const sorted = this._done.toSorted((a, b) => a.startMs - b.startMs);
    let prevStart = 0;
    const queue = new FifoQueue();
    sorted.forEach((n, i) => {
      queue.enqueue({
        midi: n.midi,
        freqHz: n.freqHz,
        durationMs: Math.round(n.durationMs),
        deltaMs: i === 0 ? 0 : Math.round(n.startMs - prevStart),
      });
      prevStart = n.startMs;
    });
    return queue;
  }
}
