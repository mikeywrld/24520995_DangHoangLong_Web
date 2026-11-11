import { useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from './GrandPiano88.module.css';
import { PolyphonicSynth } from '../../audio/PolyphonicSynth.js';
import { PianoKey } from './PianoKey.jsx';
import { NoteRecorder } from './NoteRecorder.js';
import { replay } from './replay.js';
import { KEY_BY_MIDI, PIANO_KEYS, FIRST_MIDI, LAST_MIDI, WHITE_KEY_COUNT, BLACK_KEY_COUNT } from './pianoMath.js';
import { usePianoKeyboard } from './usePianoKeyboard.js';

const MAX_VOICES = 8;
const MIDDLE_C = 60;
const defaultCreateSynth = (opts) => new PolyphonicSynth(MAX_VOICES, opts);
const defaultNow = () => performance.now(); // module-level => stable identity (an inline default would be a NEW function every render)

/** HW2 – 88-key polyphonic piano + FIFO recorder/replayer. */
export function GrandPiano88({ createSynth = defaultCreateSynth, now = defaultNow }) {
  const speedId = useId();
  const keysRef = useRef(null);
  const scrollerRef = useRef(null);
  const synthRef = useRef(null);
  const recorderRef = useRef(new NoteRecorder());
  const heldRef = useRef(new Set());
  const abortRef = useRef(null);

  const [pressed, setPressed] = useState(() => new Set());
  const [focusMidi, setFocusMidi] = useState(MIDDLE_C);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null); // FifoQueue | null
  const [speed, setSpeed] = useState('1');
  const [isReplaying, setIsReplaying] = useState(false);

  const markOn = useCallback((midi) => setPressed((prev) => new Set(prev).add(midi)), []);
  const markOff = useCallback((midi) => setPressed((prev) => {
    if (!prev.has(midi)) return prev; // same reference => React bails out, 0 renders
    const next = new Set(prev);
    next.delete(midi);
    return next;
  }), []);

  const getSynth = useCallback(() => {
    synthRef.current ??= createSynth({
      onVoiceStolen: (midi) => { heldRef.current.delete(midi); markOff(midi); }, // 9th note stole the oldest
    });
    return synthRef.current;
  }, [createSynth, markOff]);

  // Stable handlers (empty-ish deps) => memo'd keys never see a new function identity.
  const noteOn = useCallback((midi) => {
    if (heldRef.current.has(midi)) return;
    const key = KEY_BY_MIDI.get(midi);
    heldRef.current.add(midi);
    getSynth().noteOn(midi, key.freqHz);
    recorderRef.current.noteOn(midi, key.freqHz, now());
    markOn(midi);
  }, [getSynth, markOn, now]);

  const noteOff = useCallback((midi) => {
    if (!heldRef.current.delete(midi)) return;
    synthRef.current?.noteOff(midi);
    recorderRef.current.noteOff(midi, now());
    markOff(midi);
  }, [markOff, now]);

  usePianoKeyboard(noteOn, noteOff, true);

  // Roving tabindex: 1 tab stop for the whole keyboard, arrows move focus.
  const onKeysFocus = (e) => {
    const midi = Number(e.target.dataset?.midi);
    if (midi) setFocusMidi(midi);
  };
  const onKeysKeyDown = (e) => {
    const current = Number(e.target.dataset?.midi);
    if (!current) return;
    const steps = { ArrowRight: 1, ArrowLeft: -1, PageUp: 12, PageDown: -12 };
    let target = null;
    if (e.key in steps) target = current + steps[e.key];
    else if (e.key === 'Home') target = FIRST_MIDI;
    else if (e.key === 'End') target = LAST_MIDI;
    if (target === null) return;
    e.preventDefault();
    target = Math.min(LAST_MIDI, Math.max(FIRST_MIDI, target));
    keysRef.current?.querySelector(`[data-midi="${target}"]`)?.focus();
  };

  // start scrolled around middle C
  useEffect(() => {
    const scroller = scrollerRef.current;
    const middle = keysRef.current?.querySelector(`[data-midi="${MIDDLE_C}"]`);
    if (scroller && middle) scroller.scrollLeft = Math.max(0, middle.offsetLeft - scroller.clientWidth / 2);
  }, []);

  // unmount: abort replay + release audio
  useEffect(() => () => {
    abortRef.current?.abort();
    synthRef.current?.dispose();
    synthRef.current = null;
  }, []);

  const toggleRecord = () => {
    if (isRecording) {
      setRecording(recorderRef.current.stop(now()));
      setIsRecording(false);
    } else {
      recorderRef.current.start(now());
      setRecording(null);
      setIsRecording(true);
    }
  };

  const startReplay = async () => {
    if (!recording || recording.size === 0 || isReplaying) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsReplaying(true);
    try {
      await replay(recording, {
        speed: Number(speed), synth: getSynth(), signal: controller.signal, onNoteOn: markOn, onNoteOff: markOff,
      });
    } catch (err) {
      if (err.name !== 'AbortError') throw err;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsReplaying(false);
    }
  };
  const stopReplay = () => abortRef.current?.abort();

  const recordedCount = recording?.size ?? 0;

  return (
    <section className={styles.piano} aria-labelledby="piano-title">
      <header className={styles.header}>
        <h2 id="piano-title">88-Key Polyphonic Piano</h2>
        <p className="muted">
          {WHITE_KEY_COUNT} white + {BLACK_KEY_COUNT} black keys, A0–C8, max {MAX_VOICES} voices (9th note steals the oldest).
          Use pointer, Tab then ←/→ + Space/Enter, or the computer keys A W S E D F T G Y H U J K O L P.
        </p>
        <output className={styles.voices} aria-live="polite">
          Active voices: {pressed.size} / {MAX_VOICES}
        </output>
      </header>

      <section className={styles.toolbar} aria-label="Recorder">
        <button type="button" className="btn" aria-pressed={isRecording} onClick={toggleRecord} disabled={isReplaying}>
          {isRecording ? 'Stop recording' : 'Record'}
        </button>
        <p className="field">
          <label htmlFor={speedId}>Replay speed</label>
          <select id={speedId} value={speed} onChange={(e) => setSpeed(e.target.value)}>
            <option value="0.5">0.5×</option>
            <option value="1">1.0×</option>
            <option value="2">2.0×</option>
          </select>
        </p>
        <button type="button" className="btn btn--primary" onClick={startReplay}
          disabled={isRecording || isReplaying || recordedCount === 0}>Play sequence</button>
        <button type="button" className="btn btn--danger" onClick={stopReplay} disabled={!isReplaying}>Stop sequence</button>
        <output className="muted" aria-live="polite">
          {isRecording ? 'Recording…' : `${recordedCount} note${recordedCount === 1 ? '' : 's'} recorded`}
        </output>
      </section>

      <section ref={scrollerRef} className={styles.scroller} aria-label="Piano keyboard (scrollable)">
        <ul ref={keysRef} className={styles.keys} aria-label="88 piano keys" onFocus={onKeysFocus} onKeyDown={onKeysKeyDown}>
          {PIANO_KEYS.map((k) => (
            <PianoKey
              key={k.midi}
              midi={k.midi}
              noteName={k.noteName}
              ariaName={k.ariaName}
              isBlack={k.isBlack}
              slot={k.slot}
              isPressed={pressed.has(k.midi)}
              tabbable={k.midi === focusMidi}
              onNoteOn={noteOn}
              onNoteOff={noteOff}
            />
          ))}
        </ul>
      </section>
    </section>
  );
}
