'use strict';
const BeatRecorder = (() => {
  const queue = [];
  const timers = new Set();
  let state = 'idle';
  let startedAt = 0;
  function stop() {
    timers.forEach(clearTimeout); timers.clear(); state = 'idle';
  }
  function start() { stop(); queue.length = 0; startedAt = performance.now(); state = 'recording'; }
  function capture(key, src) {
    if (state !== 'recording') return;
    queue.push({ key, src, time: performance.now() - startedAt });
    if (queue.length >= 512) stop();
  }
  function replay(play, done) {
    stop(); if (!queue.length) return;
    state = 'playing';
    queue.forEach((beat, index) => {
      const timer = setTimeout(() => {
        timers.delete(timer); play(beat);
        if (index === queue.length - 1) { state = 'idle'; done(); }
      }, beat.time);
      timers.add(timer);
    });
  }
  return { start, stop, capture, replay,
    clear() { stop(); queue.length = 0; },
    get state() { return state; },
    get beats() { return queue.map(beat => ({ ...beat })); }
  };
})();
