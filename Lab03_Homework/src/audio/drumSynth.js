/**
 * Tiny Web Audio drum synth (no audio files => no network, no licensing).
 * The AudioContext is created lazily on the first user gesture (autoplay policy).
 * Every node disconnects on `ended`, dispose() closes the context.
 */
export function createDrumEngine(AudioCtor = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  let ctx = null;
  let master = null;
  let noiseBuffer = null;

  function ensure() {
    if (!AudioCtor) return null;
    if (!ctx) {
      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume?.();
    return ctx;
  }

  function noise(c) {
    if (!noiseBuffer) {
      noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    return src;
  }

  function envelope(c, peak, decay, t = c.currentTime) {
    const g = c.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    return g;
  }

  function tone(c, { type = 'sine', from, to, decay, peak = 1 }) {
    const t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + decay * 0.4);
    const g = envelope(c, peak, decay, t);
    osc.connect(g).connect(master);
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
    osc.start(t);
    osc.stop(t + decay + 0.02);
  }

  function burst(c, { filter, freq, decay, peak = 0.8, delay = 0 }) {
    const t = c.currentTime + delay;
    const src = noise(c);
    const f = c.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const g = envelope(c, peak, decay, t);
    src.connect(f).connect(g).connect(master);
    src.onended = () => { src.disconnect(); f.disconnect(); g.disconnect(); };
    src.start(t);
    src.stop(t + decay + 0.02);
  }

  const voices = {
    kick: (c) => tone(c, { from: 150, to: 45, decay: 0.35 }),
    snare: (c) => { burst(c, { filter: 'bandpass', freq: 1800, decay: 0.18 }); tone(c, { type: 'triangle', from: 220, to: 150, decay: 0.12, peak: 0.6 }); },
    hihat: (c) => burst(c, { filter: 'highpass', freq: 7000, decay: 0.05, peak: 0.5 }),
    crash: (c) => burst(c, { filter: 'highpass', freq: 5000, decay: 0.9, peak: 0.6 }),
    tomHigh: (c) => tone(c, { from: 260, to: 150, decay: 0.28 }),
    tomLow: (c) => tone(c, { from: 170, to: 90, decay: 0.34 }),
    clap: (c) => { [0, 0.015, 0.03].forEach((d) => burst(c, { filter: 'bandpass', freq: 1200, decay: 0.08, delay: d })); },
  };

  return {
    /** @returns {boolean} true when a sound was scheduled */
    play(sound) {
      const c = ensure();
      const voice = voices[sound];
      if (!c || !voice) return false;
      voice(c);
      return true;
    },
    dispose() {
      if (ctx) ctx.close?.();
      ctx = null; master = null; noiseBuffer = null;
    },
  };
}
