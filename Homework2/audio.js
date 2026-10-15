'use strict';
// Independent of DOM and keyboard bindings. Each hit owns its Audio instance.
const AudioEngine = (() => {
  const voices = new Set();
  function play(src) {
    const voice = new Audio(src);
    voices.add(voice);
    const release = () => voices.delete(voice);
    voice.addEventListener('ended', release, { once: true });
    voice.addEventListener('error', release, { once: true });
    return voice.play().catch(error => { release(); throw error; });
  }
  function stopAll() {
    for (const voice of voices) { voice.pause(); voice.currentTime = 0; }
    voices.clear();
  }
  return { play, stopAll, get activeCount() { return voices.size; } };
})();
