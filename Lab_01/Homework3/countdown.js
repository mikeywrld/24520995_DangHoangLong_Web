'use strict';
const Countdown = (() => {
  function remaining(target, now = Date.now()) { return Math.max(0, target - now); }
  const root = document.querySelector('#countdown');
  const iso = root.dataset.deadline;
  const target = Date.parse(iso);
  const status = document.querySelector('#timer-status');
  let interval = null;
  function tick() {
    if (!iso.endsWith('Z') || !Number.isFinite(target)) {
      status.textContent = 'Invalid event time. A UTC ISO timestamp is required.';
      clearInterval(interval); return;
    }
    const seconds = Math.ceil(remaining(target) / 1000);
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
      document.getElementById(id).textContent = String(values[index]).padStart(2, '0');
    });
    if (!seconds) { status.textContent = 'The event has started!'; clearInterval(interval); interval = null; }
  }
  function start() { clearInterval(interval); interval = setInterval(tick, 250); tick(); }
  start();
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pagehide', () => { clearInterval(interval); interval = null; });
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  return { remaining, tick };
})();
