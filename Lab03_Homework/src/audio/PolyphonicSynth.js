const PEAK_GAIN = 0.12;       // 8 voices * 0.12 * master 0.8 < 1.0 => no clipping
const ATTACK_S = 0.01;
const RELEASE_S = 0.04;       // click-free ramp before osc.stop()
const SILENCE = 0.0001;

/**
 * 8-voice polyphonic synth with FIFO voice stealing.
 * `voices` is an ES6 Map => iteration order = insertion order = FIFO (oldest key first, O(1)).
 */
export class PolyphonicSynth {
  constructor(maxVoices = 8, { AudioCtor = globalThis.AudioContext ?? globalThis.webkitAudioContext, onVoiceStolen } = {}) {
    this.maxVoices = maxVoices;
    this.AudioCtor = AudioCtor;
    this.onVoiceStolen = onVoiceStolen;
    this.ctx = null;
    this.master = null;
    this.voices = new Map(); // midi -> { osc, gain }
  }

  _ensure() {
    if (!this.AudioCtor) return null;
    if (!this.ctx) {
      this.ctx = new this.AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume?.();
    return this.ctx;
  }

  get activeCount() { return this.voices.size; }
  activeMidis() { return [...this.voices.keys()]; }

  /** @returns {boolean} true if a new voice started */
  noteOn(midi, freqHz) {
    const ctx = this._ensure();
    if (!ctx || this.voices.has(midi)) return false;

    if (this.voices.size >= this.maxVoices) {
      const oldest = this.voices.keys().next().value; // FIFO voice stealing
      this.noteOff(oldest);
      this.onVoiceStolen?.(oldest);
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqHz, t);
    gain.gain.setValueAtTime(SILENCE, t);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, t + ATTACK_S);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    this.voices.set(midi, { osc, gain });
    return true;
  }

  /** @returns {boolean} true if a voice was released */
  noteOff(midi) {
    const voice = this.voices.get(midi);
    if (!voice) return false;
    this.voices.delete(midi);
    const { osc, gain } = voice;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, SILENCE), t);
    gain.gain.exponentialRampToValueAtTime(SILENCE, t + RELEASE_S); // ramp BEFORE stop => no pop
    osc.stop(t + RELEASE_S + 0.005);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    return true;
  }

  allNotesOff() {
    for (const midi of [...this.voices.keys()]) this.noteOff(midi);
  }

  dispose() {
    this.allNotesOff();
    if (this.ctx) this.ctx.close?.();
    this.ctx = null;
    this.master = null;
  }
}
