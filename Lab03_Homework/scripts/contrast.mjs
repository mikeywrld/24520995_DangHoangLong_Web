// WCAG 2.x contrast checker for the design tokens in src/styles/global.css
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`missing token --${name}`);
  return m[1];
};
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio, what]
const pairs = [
  ['text', 'bg', 4.5, 'body text'],
  ['text', 'surface', 4.5, 'text on card'],
  ['text', 'surface-2', 4.5, 'text on button / key'],
  ['muted', 'bg', 4.5, 'muted text on page'],
  ['muted', 'surface', 4.5, 'muted text on card'],
  ['muted', 'surface-2', 4.5, 'muted text on raised surface'],
  ['accent-ink', 'accent', 4.5, 'primary button / pressed pad'],
  ['accent', 'bg', 4.5, 'accent text on page'],
  ['accent', 'surface', 4.5, 'accent text on card'],
  ['info', 'surface', 4.5, 'link on card'],
  ['danger', 'danger-bg', 4.5, 'error text'],
  ['danger', 'surface', 4.5, 'error text on card'],
  ['ok', 'surface', 4.5, 'success text'],
  ['border', 'bg', 3, 'UI component border (1.4.11)'],
  ['border', 'surface', 3, 'UI border on card (1.4.11)'],
  ['focus', 'bg', 3, 'focus ring (2.4.11)'],
];
let fail = 0;
console.log('fg            bg          ratio   min   result');
for (const [fg, bg, min, what] of pairs) {
  const r = ratio(token(fg), token(bg));
  const ok = r >= min;
  if (!ok) fail += 1;
  console.log(`${fg.padEnd(13)} ${bg.padEnd(11)} ${r.toFixed(2).padStart(5)}  ${String(min).padStart(4)}  ${ok ? 'PASS' : 'FAIL'}  ${what}`);
}
console.log(fail === 0 ? `\ncontrast: all ${pairs.length} pairs pass WCAG 2.2 AA` : `\ncontrast: ${fail} pair(s) FAIL`);
process.exit(fail === 0 ? 0 : 1);
