import { abortError, sleep } from '../../lib/sleep.js';

/**
 * Replay a recorded FIFO queue asynchronously at 0.5x / 1x / 2x.
 * Cancelling the AbortSignal (Stop button / unmount) clears every pending timer,
 * releases all sounding voices and rejects with AbortError.
 */
export async function replay(queue, { speed = 1, synth, signal, onNoteOn, onNoteOff }) {
  const events = queue.toArray();
  const releases = [];
  try {
    for (const ev of events) {
      await sleep(ev.deltaMs / speed, signal);
      synth.noteOn(ev.midi, ev.freqHz);
      onNoteOn?.(ev.midi);
      releases.push(
        sleep(ev.durationMs / speed, signal).then(
          () => { synth.noteOff(ev.midi); onNoteOff?.(ev.midi); },
          (err) => { if (err.name !== 'AbortError') throw err; },
        ),
      );
    }
    await Promise.all(releases);
    if (signal?.aborted) throw abortError();
  } catch (err) {
    if (err.name === 'AbortError') {
      synth.allNotesOff();
      events.forEach((ev) => onNoteOff?.(ev.midi));
    }
    throw err;
  }
}
