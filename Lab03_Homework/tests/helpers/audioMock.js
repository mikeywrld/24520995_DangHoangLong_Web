/** Minimal Web Audio double that records what the synth does. */
export function makeAudioMock() {
  const created = { oscillators: [], gains: [], contexts: [] };

  class Param {
    constructor(v = 0) { this.value = v; this.calls = []; }
    setValueAtTime(v, t) { this.value = v; this.calls.push(['set', v, t]); return this; }
    exponentialRampToValueAtTime(v, t) { this.calls.push(['ramp', v, t]); return this; }
    cancelScheduledValues(t) { this.calls.push(['cancel', t]); return this; }
  }
  class Node {
    connect(next) { return next; }
    disconnect() { this.disconnected = true; }
  }
  class Osc extends Node {
    constructor() { super(); this.frequency = new Param(440); this.type = 'sine'; created.oscillators.push(this); }
    start(t) { this.startedAt = t; }
    stop(t) { this.stoppedAt = t; }
  }
  class Gain extends Node {
    constructor() { super(); this.gain = new Param(1); created.gains.push(this); }
  }
  class Src extends Node { start() {} stop() {} }
  class Filter extends Node { constructor() { super(); this.frequency = { value: 0 }; this.type = ''; } }
  class Ctx {
    constructor() { this.currentTime = 0; this.state = 'running'; this.sampleRate = 100; this.destination = new Node(); created.contexts.push(this); }
    createOscillator() { return new Osc(); }
    createGain() { return new Gain(); }
    createBuffer() { return { getChannelData: () => new Float32Array(100) }; }
    createBufferSource() { return new Src(); }
    createBiquadFilter() { return new Filter(); }
    resume() {}
    close() { this.closed = true; }
  }
  return { AudioCtor: Ctx, created };
}
