'use strict';
const pads = [...document.querySelectorAll('.pad')];
const bindings = new Map(pads.map(pad => [pad.dataset.key, pad]));
const audioStatus = document.querySelector('#audio-status');
const flashes = new Map();
function triggerPad(pad, capture = true) {
  if (capture) { BeatRecorder.capture(pad.dataset.key, pad.dataset.sound); refreshRecorder(); }
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
  if (event.key === ' ') { event.preventDefault(); AudioEngine.stopAll(); BeatRecorder.stop(); refreshRecorder(); return; }
  const pad = bindings.get(event.key.toLowerCase());
  if (pad) { event.preventDefault(); triggerPad(pad); }
});
window.addEventListener('pagehide', () => {
  AudioEngine.stopAll();
  flashes.forEach(clearTimeout);
  flashes.clear();
});
const recordButton = document.querySelector('#record');
const stopButton = document.querySelector('#stop');
const replayButton = document.querySelector('#replay');
const clearButton = document.querySelector('#clear');
const recordStatus = document.querySelector('#record-status');
const beatList = document.querySelector('#beat-list');
function refreshRecorder() {
  const beats = BeatRecorder.beats;
  recordButton.disabled = BeatRecorder.state !== 'idle';
  stopButton.disabled = BeatRecorder.state === 'idle';
  replayButton.disabled = !beats.length || BeatRecorder.state !== 'idle';
  clearButton.disabled = !beats.length || BeatRecorder.state !== 'idle';
  recordStatus.textContent = `${BeatRecorder.state} · ${beats.length} / 512 hits`;
  beatList.replaceChildren(...beats.map(beat => {
    const item = document.createElement('li');
    item.textContent = `${beat.key.toUpperCase()} · ${Math.round(beat.time)} ms`;
    return item;
  }));
}
recordButton.addEventListener('click', () => { AudioEngine.stopAll(); BeatRecorder.start(); refreshRecorder(); });
stopButton.addEventListener('click', () => { BeatRecorder.stop(); AudioEngine.stopAll(); refreshRecorder(); });
clearButton.addEventListener('click', () => { BeatRecorder.clear(); refreshRecorder(); });
replayButton.addEventListener('click', () => {
  BeatRecorder.replay(beat => triggerPad(bindings.get(beat.key), false), refreshRecorder);
  refreshRecorder();
});
window.addEventListener('pagehide', () => BeatRecorder.stop());
