import { memo } from 'react';
import styles from './GrandPiano88.module.css';
import { renderProbe } from '../../lib/renderProbe.js';

/**
 * Memoised key: re-renders ONLY when one of its own primitive props flips
 * (isPressed / tabbable). Handlers are stable (useCallback in the parent).
 */
export const PianoKey = memo(function PianoKey({
  midi, noteName, ariaName, isBlack, slot, isPressed, tabbable, onNoteOn, onNoteOff,
}) {
  renderProbe.hit(midi);
  return (
    <li className={isBlack ? styles.blackSlot : styles.whiteSlot} style={{ '--slot': slot }}>
      <button
        type="button"
        data-midi={midi}
        className={`${styles.key} ${isBlack ? styles.black : styles.white}`}
        aria-pressed={isPressed}
        aria-label={ariaName}
        tabIndex={tabbable ? 0 : -1}
        onPointerDown={() => onNoteOn(midi)}
        onPointerUp={() => onNoteOff(midi)}
        onPointerLeave={() => onNoteOff(midi)}
        onPointerCancel={() => onNoteOff(midi)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); onNoteOn(midi); }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNoteOff(midi); }
        }}
        onBlur={() => onNoteOff(midi)}
      >
        <span className={styles.label} aria-hidden="true">{isBlack ? '' : noteName}</span>
      </button>
    </li>
  );
});
