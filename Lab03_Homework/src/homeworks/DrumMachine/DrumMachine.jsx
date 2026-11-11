import { useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from './DrumMachine.module.css';
import { createDrumEngine } from '../../audio/drumSynth.js';
import { PADS, PAD_BY_ID, PAD_MAP } from './pads.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';

const MAX_LOG = 8;
const TAP_RELEASE_MS = 140;

function toDb(level) {
  return level <= 0 ? '−∞ dB' : `${Math.round(20 * Math.log10(level / 100))} dB`;
}

/** HW1 – Production Studio Drum Kit (WCAG 2.2 AA). */
export function DrumMachine({ createEngine = createDrumEngine }) {
  const labelId = useId();
  const engineRef = useRef(null);
  const timersRef = useRef(new Set());
  const hitSeq = useRef(0);

  const [activeIds, setActiveIds] = useState(() => new Set());
  const [log, setLog] = useState([]);
  const [level, setLevel] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [session, setSession] = useState('My beat');

  const trigger = useCallback((id) => {
    const pad = PAD_BY_ID.get(id);
    if (!pad) return;
    if (soundOn) {
      engineRef.current ??= createEngine();
      engineRef.current.play(pad.sound);
    }
    hitSeq.current += 1;
    const entry = { id: hitSeq.current, label: pad.label, key: pad.key };
    setActiveIds((prev) => new Set(prev).add(id));
    setLog((prev) => [entry, ...prev].slice(0, MAX_LOG));
    setLevel(100);
  }, [soundOn, createEngine]);

  const release = useCallback((id) => {
    setActiveIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // keyboard-activated click (Enter/Space => detail === 0). Pointer presses use onPointerDown.
  const tap = useCallback((id) => {
    trigger(id);
    const t = window.setTimeout(() => { timersRef.current.delete(t); release(id); }, TAP_RELEASE_MS);
    timersRef.current.add(t);
  }, [trigger, release]);

  useDrumKeyboard(PAD_MAP, trigger, true, release);

  // decibel meter decay – runs only while there is level to drain, always cleaned up
  const hasLevel = level > 0;
  useEffect(() => {
    if (!hasLevel) return undefined;
    const id = window.setInterval(() => setLevel((l) => Math.max(0, l - 6)), 50);
    return () => window.clearInterval(id);
  }, [hasLevel]);

  // unmount: pending release timers + audio context
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <section className={styles.studio} aria-labelledby="drum-title">
      <header className={styles.header}>
        <h2 id="drum-title">Production Studio Drum Kit</h2>
        <p className="muted">
          Press <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> or tap a pad.
          Shortcuts are paused while you type in a field.
        </p>
        <p className="field">
          <label htmlFor={labelId}>Session name</label>
          <input id={labelId} type="text" value={session} onChange={(e) => setSession(e.target.value)} />
        </p>
        <button type="button" className="btn" aria-pressed={soundOn} onClick={() => setSoundOn((v) => !v)}>
          Sound {soundOn ? 'on' : 'off (visual only)'}
        </button>
      </header>

      <ul className={styles.pads} aria-label="Drum pads">
        {PADS.map((pad) => {
          const isActive = activeIds.has(pad.id);
          return (
            <li key={pad.id}>
              <button
                type="button"
                className={`${styles.pad} ${isActive ? styles.padActive : ''}`}
                aria-pressed={isActive}
                aria-keyshortcuts={pad.key}
                onPointerDown={(e) => { if (e.pointerType !== 'mouse' || e.button === 0) trigger(pad.id); }}
                onPointerUp={() => release(pad.id)}
                onPointerLeave={() => release(pad.id)}
                onPointerCancel={() => release(pad.id)}
                onClick={(e) => { if (e.detail === 0) tap(pad.id); }}
              >
                <span className={styles.key} aria-hidden="true">{pad.key}</span>
                <span>{pad.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <section className={styles.meterBox} aria-label="Visual feedback for deaf and hard-of-hearing players">
        <p className={styles.meterRow}>
          <label htmlFor={`${labelId}-meter`}>Output level</label>
          <meter id={`${labelId}-meter`} className={styles.meter} min={0} max={100} value={level}>{level}%</meter>
          <span className="muted" aria-hidden="true">{toDb(level)}</span>
        </p>
        <h3>Hit log — {session}</h3>
        <output className={styles.log} aria-live="polite">
          {log.length === 0 ? 'No hits yet.' : `Last hit: ${log[0].label} (${log[0].key})`}
        </output>
        <ol className={styles.logList} aria-label="Hit history, newest first" reversed>
          {log.map((hit) => (
            <li key={hit.id}>#{hit.id} {hit.label} <span className="muted">({hit.key})</span></li>
          ))}
        </ol>
      </section>
    </section>
  );
}
