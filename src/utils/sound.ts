class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted = false;
  private ambienceEnabled = true;
  private ambienceActive = false;

  // Ambient audio nodes
  private ambienceMasterGain: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private birdTimerId: number | null = null;

  private ensureContext(allowWhenMuted = false): AudioContext | null {
    if ((!allowWhenMuted && this.muted) || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.syncAmbience();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setAmbienceEnabled(enabled: boolean) {
    this.ambienceEnabled = enabled;
    this.syncAmbience();
  }

  public isAmbienceEnabled(): boolean {
    return this.ambienceEnabled;
  }

  public unlockAndStartAmbience() {
    if (typeof window === 'undefined') return;
    if (this.ambienceEnabled && !this.muted) {
      const ctx = this.ensureContext(true);
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume().then(() => this.syncAmbience());
      } else {
        this.syncAmbience();
      }
    }
  }

  private syncAmbience() {
    const shouldPlay = this.ambienceEnabled && !this.muted;
    if (shouldPlay && !this.ambienceActive) {
      this.startAmbienceLoop();
    } else if (!shouldPlay && this.ambienceActive) {
      this.stopAmbienceLoop();
    }
  }

  private startAmbienceLoop() {
    const ctx = this.ensureContext();
    if (!ctx || this.ambienceActive) return;

    this.ambienceActive = true;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.8);
    master.connect(ctx.destination);
    this.ambienceMasterGain = master;

    // 1. Gentle Park Breeze (Looping soft pink-ish noise through modulated bandpass filter)
    const sampleRate = ctx.sampleRate;
    const bufferLen = sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferLen, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferLen; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2) * 0.35;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(380, ctx.currentTime);
    windFilter.Q.setValueAtTime(0.75, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.08, ctx.currentTime);

    // Slow breeze swell LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoFilterGain = ctx.createGain();
    lfoFilterGain.gain.setValueAtTime(150, ctx.currentTime);
    lfo.connect(lfoFilterGain);
    lfoFilterGain.connect(windFilter.frequency);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);

    windSource.start();
    lfo.start();
    this.windSource = windSource;
    this.windLfo = lfo;

    // 2. Cheerful Park Birds Chirping Scheduler
    const scheduleNextBird = (initialDelayMs?: number) => {
      if (!this.ambienceActive) return;
      const delay = initialDelayMs ?? 2000 + Math.random() * 2800;
      this.birdTimerId = window.setTimeout(() => {
        if (this.ambienceActive && !this.muted && this.ambienceEnabled) {
          this.playBirdChirp();
        }
        scheduleNextBird();
      }, delay);
    };
    scheduleNextBird(650);
  }

  private stopAmbienceLoop() {
    this.ambienceActive = false;
    if (this.birdTimerId !== null) {
      window.clearTimeout(this.birdTimerId);
      this.birdTimerId = null;
    }
    const ctx = this.ctx;
    if (this.ambienceMasterGain && ctx) {
      const now = ctx.currentTime;
      this.ambienceMasterGain.gain.cancelScheduledValues(now);
      this.ambienceMasterGain.gain.setValueAtTime(this.ambienceMasterGain.gain.value, now);
      this.ambienceMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
    }
    const wind = this.windSource;
    const lfo = this.windLfo;
    const master = this.ambienceMasterGain;
    this.windSource = null;
    this.windLfo = null;
    this.ambienceMasterGain = null;

    window.setTimeout(() => {
      try {
        wind?.stop();
        wind?.disconnect();
        lfo?.stop();
        lfo?.disconnect();
        master?.disconnect();
      } catch {
        // already stopped
      }
    }, 300);
  }

  private playBirdChirp() {
    const ctx = this.ctx;
    const master = this.ambienceMasterGain;
    if (!ctx || !master || ctx.state !== 'running') return;

    const noteCount = 2 + Math.floor(Math.random() * 3); // 2-4 chirps per phrase
    const baseFreq = 2100 + Math.random() * 1200;

    for (let i = 0; i < noteCount; i++) {
      const start = ctx.currentTime + i * (0.09 + Math.random() * 0.05);
      const dur = 0.065 + Math.random() * 0.04;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const f0 = baseFreq + (Math.random() - 0.5) * 350;
      const f1 = f0 * (1.18 + Math.random() * 0.22);
      osc.frequency.setValueAtTime(f0, start);
      osc.frequency.exponentialRampToValueAtTime(f1, start + dur * 0.65);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.92, start + dur);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.032, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(master);

      osc.start(start);
      osc.stop(start + dur + 0.015);
    }
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.14,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playPickup() {
    this.playTone(360, 540, 0.09, 'sine', 0.12);
  }

  public playDrop() {
    this.playTone(320, 220, 0.08, 'triangle', 0.1);
  }

  public playSuccess(combo = 1) {
    const pitchBoost = Math.min(combo - 1, 4) * 35;
    this.playTone(523.25 + pitchBoost, 523.25 + pitchBoost, 0.12, 'triangle', 0.13, 0);
    this.playTone(659.25 + pitchBoost, 659.25 + pitchBoost, 0.12, 'triangle', 0.13, 0.07);
    this.playTone(783.99 + pitchBoost, 783.99 + pitchBoost, 0.18, 'sine', 0.14, 0.14);
  }

  public playWrong() {
    this.playTone(250, 185, 0.16, 'triangle', 0.12, 0);
    this.playTone(195, 145, 0.18, 'triangle', 0.1, 0.1);
  }

  public playMeow() {
    this.playTone(620, 880, 0.11, 'sine', 0.1, 0);
    this.playTone(880, 590, 0.16, 'sine', 0.1, 0.11);
  }

  public playPurr() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 0.42;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const master = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(102, now);
    osc.frequency.linearRampToValueAtTime(92, now + dur);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, now);
    lfoGain.gain.setValueAtTime(0.03, now);

    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(0.075, now + 0.06);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);

    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    osc.connect(master);
    master.connect(ctx.destination);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + dur + 0.02);
    lfo.stop(now + dur + 0.02);
  }

  public playBuy() {
    this.playTone(880, 920, 0.09, 'sine', 0.12, 0);
    this.playTone(1318.5, 1340, 0.16, 'triangle', 0.13, 0.07);
  }

  public playEatTreat() {
    this.playTone(420, 560, 0.07, 'triangle', 0.12, 0);
    this.playTone(480, 620, 0.07, 'triangle', 0.12, 0.09);
    this.playTone(659.25, 880, 0.18, 'sine', 0.13, 0.18);
  }

  public playMagic() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => {
      this.playTone(n, n * 1.04, 0.16, 'sine', 0.11, i * 0.06);
    });
  }

  public playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, n, 0.22, 'triangle', 0.13, i * 0.09);
    });
  }
}

export const soundFx = new SoundEffects();
