import { useEffect, useRef } from 'react';

// Computer-keyboard piano (e.code => MIDI), one octave + 4 notes from middle C.
export const COMPUTER_KEY_TO_MIDI = new Map([
  ['KeyA', 60], ['KeyW', 61], ['KeyS', 62], ['KeyE', 63], ['KeyD', 64], ['KeyF', 65], ['KeyT', 66],
  ['KeyG', 67], ['KeyY', 68], ['KeyH', 69], ['KeyU', 70], ['KeyJ', 71], ['KeyK', 72], ['KeyO', 73],
  ['KeyL', 74], ['KeyP', 75],
]);

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

export function usePianoKeyboard(onNoteOn, onNoteOff, isEnabled = true) {
  const heldRef = useRef(new Set()); // survives effect re-subscription (a keyup must still find its keydown)
  useEffect(() => {
    if (!isEnabled) return undefined;
    const held = heldRef.current;
    const typing = (t) => Boolean(t) && (TYPING_TAGS.includes(t.tagName) || t.isContentEditable === true);

    const down = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      const midi = COMPUTER_KEY_TO_MIDI.get(e.code);
      if (midi === undefined) return;
      e.preventDefault();
      held.add(midi);
      onNoteOn(midi);
    };
    const up = (e) => {
      const midi = COMPUTER_KEY_TO_MIDI.get(e.code);
      if (midi !== undefined && held.delete(midi)) onNoteOff(midi);
    };
    const blur = () => { held.forEach((m) => onNoteOff(m)); held.clear(); };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [onNoteOn, onNoteOff, isEnabled]);
}
