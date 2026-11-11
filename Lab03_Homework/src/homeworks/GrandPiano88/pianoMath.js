export const FIRST_MIDI = 21; // A0
export const LAST_MIDI = 108; // C8
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

/** Equal temperament: f = 440 * 2^((midi - 69) / 12) */
export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Algorithmic 88-key generation (A0..C8) – nothing is hard-coded.
 * `slot` = horizontal slot on the white-key grid:
 *   white key  -> its own white index (0..51)
 *   black key  -> number of white keys before it (it straddles slot-1 | slot)
 * @returns {Array<{midi:number,noteName:string,ariaName:string,isBlack:boolean,freqHz:number,octave:number,slot:number}>}
 */
export function generatePianoKeys(first = FIRST_MIDI, last = LAST_MIDI) {
  const keys = [];
  let whites = 0;
  for (let midi = first; midi <= last; midi += 1) {
    const pc = midi % 12;
    const isBlack = BLACK_PITCH_CLASSES.has(pc);
    const octave = Math.floor(midi / 12) - 1;
    const letter = NAMES[pc];
    keys.push({
      midi,
      noteName: `${letter}${octave}`,
      ariaName: `${letter[0]}${isBlack ? ' sharp' : ''} ${octave}`,
      isBlack,
      freqHz: midiToFreq(midi),
      octave,
      slot: whites,
    });
    if (!isBlack) whites += 1;
  }
  return keys;
}

export const PIANO_KEYS = generatePianoKeys();
export const KEY_BY_MIDI = new Map(PIANO_KEYS.map((k) => [k.midi, k]));
export const WHITE_KEY_COUNT = PIANO_KEYS.filter((k) => !k.isBlack).length;
export const BLACK_KEY_COUNT = PIANO_KEYS.length - WHITE_KEY_COUNT;
