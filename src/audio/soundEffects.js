/**
 * Procedural Web Audio API sound effects (no external audio files, no background music).
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Short crisp UI button click tone.
   */
  playClick() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.055);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // Ignore audio errors in headless environments
    }
  }

  /**
   * Smooth soft whoosh for camera transitions between scenes.
   */
  playWhoosh() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const duration = 0.42;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(300, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Soft, smooth futuristic harmonic chime when Julia activates.
   */
  playJuliaChime() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // Smooth C5-E5-G5-C6 chime
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.065;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.72);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.75);
      });
    } catch {
      // Ignore audio errors
    }
  }
}

export const soundEngine = new SoundEngine();
