'use strict';
const pads = [...document.querySelectorAll('.pad')];
const bindings = new Map(pads.map(pad => [pad.dataset.key, pad]));
const audioStatus = document.querySelector('#audio-status');
const flashes = new Map();
function triggerPad(pad) {
  AudioEngine.play(pad.dataset.sound).catch(() => {
    audioStatus.textContent = 'Audio could not play. Check the local sound file and try again.';
  });
  audioStatus.textContent = `Playing ${pad.querySelector('strong').textContent}.`;
  pad.classList.add('active');
  clearTimeout(flashes.get(pad));
  flashes.set(pad, setTimeout(() => { pad.classList.remove('active'); flashes.delete(pad); }, 120));
}
pads.forEach(pad => pad.addEventListener('click', () => triggerPad(pad)));
window.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === ' ') { event.preventDefault(); AudioEngine.stopAll(); return; }
  const pad = bindings.get(event.key.toLowerCase());
  if (pad) { event.preventDefault(); triggerPad(pad); }
});
window.addEventListener('pagehide', () => {
  AudioEngine.stopAll();
  flashes.forEach(clearTimeout);
  flashes.clear();
});
