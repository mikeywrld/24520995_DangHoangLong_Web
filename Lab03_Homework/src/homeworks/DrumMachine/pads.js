/** Physical key codes (KeyboardEvent.code) so Vietnamese IME (UniKey/Telex) cannot break triggers. */
export const PADS = [
  { id: 'crash', code: 'KeyW', key: 'W', label: 'Crash', sound: 'crash' },
  { id: 'kick', code: 'KeyA', key: 'A', label: 'Kick', sound: 'kick' },
  { id: 'snare', code: 'KeyS', key: 'S', label: 'Snare', sound: 'snare' },
  { id: 'hihat', code: 'KeyD', key: 'D', label: 'Hi-Hat', sound: 'hihat' },
  { id: 'tom-high', code: 'KeyJ', key: 'J', label: 'Tom High', sound: 'tomHigh' },
  { id: 'tom-low', code: 'KeyK', key: 'K', label: 'Tom Low', sound: 'tomLow' },
  { id: 'clap', code: 'KeyL', key: 'L', label: 'Clap', sound: 'clap' },
];

/** e.code -> pad */
export const PAD_MAP = new Map(PADS.map((p) => [p.code, p]));
export const PAD_BY_ID = new Map(PADS.map((p) => [p.id, p]));
