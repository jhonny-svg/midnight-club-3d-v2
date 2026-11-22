import { RadioStation } from './types';

export class MidnightAudioEngine {
  private ctx: AudioContext | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;

  private nitroGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private initialized = false;

  private muted = false;
  private masterVol = 0.85;
  private engineVol = 0.8;
  private sfxVol = 0.85;

  // Radio Phonk / Synthwave procedural sequencer
  private radioStation: RadioStation = 'OFF';
  private radioTimer: number | null = null;
  private radioStep = 0;
  private radioNextTime = 0;

  public unlock() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      this.ctx = ctx;

      // 1. Engine Synth
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 55;

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 110;

      const engFilter = ctx.createBiquadFilter();
      engFilter.type = 'lowpass';
      engFilter.frequency.value = 650;

      const engGain = ctx.createGain();
      engGain.gain.value = 0;

      osc1.connect(engFilter);
      osc2.connect(engFilter);
      engFilter.connect(engGain);
      engGain.connect(ctx.destination);
      osc1.start();
      osc2.start();

      this.engineOsc1 = osc1;
      this.engineOsc2 = osc2;
      this.engineFilter = engFilter;
      this.engineGain = engGain;

      // 2. Shared Noise Buffer for Rain, Nitro & Backfires
      const bufSize = ctx.sampleRate * 2;
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = data[i];
      }
      this.noiseBuffer = noiseBuf;

      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = noiseBuf;
      rainSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 1400;
      rainFilter.Q.value = 0.6;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(ctx.destination);
      rainSrc.start();

      this.rainFilter = rainFilter;
      this.rainGain = rainGain;

      // 3. Nitro Boost Hiss
      const nitroSrc = ctx.createBufferSource();
      nitroSrc.buffer = noiseBuf;
      nitroSrc.loop = true;
      const nitroFilter = ctx.createBiquadFilter();
      nitroFilter.type = 'highpass';
      nitroFilter.frequency.value = 1800;
      const nitroGain = ctx.createGain();
      nitroGain.gain.value = 0;
      nitroSrc.connect(nitroFilter);
      nitroFilter.connect(nitroGain);
      nitroGain.connect(ctx.destination);
      nitroSrc.start();
      this.nitroGain = nitroGain;

      this.initialized = true;
    } catch {
      // Ignore audio init errors
    }
  }

  public setVolumes(opts: {
    master: number;
    engine: number;
    sfx: number;
    muted: boolean;
  }) {
    this.masterVol = Math.min(1, Math.max(0, opts.master));
    this.engineVol = Math.min(1, Math.max(0, opts.engine));
    this.sfxVol = Math.min(1, Math.max(0, opts.sfx));
    this.setMuted(opts.muted);
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute && this.ctx) {
      const now = this.ctx.currentTime;
      this.engineGain?.gain.setTargetAtTime(0, now, 0.05);
      this.rainGain?.gain.setTargetAtTime(0, now, 0.05);
      this.nitroGain?.gain.setTargetAtTime(0, now, 0.05);
    }
  }

  public isMuted() {
    return this.muted;
  }

  public getRadioStation(): RadioStation {
    return this.radioStation;
  }

  public setRadioStation(station: RadioStation) {
    this.radioStation = station;
    if (station === 'OFF') {
      if (this.radioTimer !== null) {
        window.clearInterval(this.radioTimer);
        this.radioTimer = null;
      }
      return;
    }
    this.unlock();
    if (this.ctx) {
      this.radioNextTime = this.ctx.currentTime + 0.04;
    }
    if (this.radioTimer === null) {
      this.radioTimer = window.setInterval(() => this.scheduleRadio(), 50);
    }
  }

  public cycleRadioStation(): RadioStation {
    const next: RadioStation =
      this.radioStation === 'OFF'
        ? 'PHONK'
        : this.radioStation === 'PHONK'
          ? 'SYNTHWAVE'
          : 'OFF';
    this.setRadioStation(next);
    return next;
  }

  private scheduleRadio() {
    if (!this.ctx || !this.initialized || this.muted || this.radioStation === 'OFF') return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;

    const bpm = this.radioStation === 'PHONK' ? 130 : 108;
    const stepDur = 60 / bpm / 4; // 16th note
    if (this.radioNextTime < this.ctx.currentTime - 0.15) {
      this.radioNextTime = this.ctx.currentTime + 0.03;
    }

    while (this.radioNextTime < this.ctx.currentTime + 0.14) {
      const t = this.radioNextTime;
      const step = this.radioStep % 16;
      if (this.radioStation === 'PHONK') {
        this.triggerPhonkStep(t, step, scale);
      } else {
        this.triggerSynthwaveStep(t, step, scale);
      }
      this.radioNextTime += stepDur;
      this.radioStep++;
    }
  }

  private triggerPhonkStep(t: number, step: number, scale: number) {
    if (!this.ctx) return;
    // Punchy 808 kick & sub bass
    if (step === 0 || step === 3 || step === 6 || step === 10) {
      const kOsc = this.ctx.createOscillator();
      kOsc.type = 'sine';
      kOsc.frequency.setValueAtTime(118, t);
      kOsc.frequency.exponentialRampToValueAtTime(36, t + 0.16);
      const kg = this.ctx.createGain();
      kg.gain.setValueAtTime(0.11 * scale, t);
      kg.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      kOsc.connect(kg);
      kg.connect(this.ctx.destination);
      kOsc.start(t);
      kOsc.stop(t + 0.24);
    }
    // Classic Drift Phonk 808 Memphis cowbell melody
    const cowbellPattern: Record<number, number> = {
      0: 587.33, // D5
      2: 659.25, // E5
      4: 698.46, // F5
      6: 587.33,
      8: 783.99, // G5
      10: 698.46,
      12: 659.25,
      14: 523.25, // C5
    };
    const cowHz = cowbellPattern[step];
    if (cowHz) {
      const o1 = this.ctx.createOscillator();
      const o2 = this.ctx.createOscillator();
      o1.type = 'square';
      o2.type = 'square';
      o1.frequency.setValueAtTime(cowHz, t);
      o2.frequency.setValueAtTime(cowHz * 1.498, t);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(cowHz * 1.4, t);
      bp.Q.value = 3.2;
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(0.045 * scale, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o1.connect(bp);
      o2.connect(bp);
      bp.connect(cg);
      cg.connect(this.ctx.destination);
      o1.start(t);
      o2.start(t);
      o1.stop(t + 0.15);
      o2.stop(t + 0.15);
    }
    // Crisp closed hats + trap snare on 4 & 12
    if (this.noiseBuffer && (step % 2 === 0 || step === 4 || step === 12)) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      const isSnare = step === 4 || step === 12;
      hp.type = isSnare ? 'bandpass' : 'highpass';
      hp.frequency.setValueAtTime(isSnare ? 1900 : 6200, t);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime((isSnare ? 0.055 : 0.022) * scale, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + (isSnare ? 0.12 : 0.04));
      src.connect(hp);
      hp.connect(ng);
      ng.connect(this.ctx.destination);
      src.start(t, 0.1, isSnare ? 0.14 : 0.05);
    }
  }

  private triggerSynthwaveStep(t: number, step: number, scale: number) {
    if (!this.ctx) return;
    // Driving analog 16th-note saw bassline
    const bassNotes = [65.41, 65.41, 65.41, 65.41, 87.31, 87.31, 98.0, 98.0];
    const barSlot = Math.floor(this.radioStep / 16) % bassNotes.length;
    const bassHz = bassNotes[barSlot];
    const bOsc = this.ctx.createOscillator();
    bOsc.type = 'sawtooth';
    bOsc.frequency.setValueAtTime(bassHz, t);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(step % 4 === 0 ? 640 : 420, t);
    const bg = this.ctx.createGain();
    bg.gain.setValueAtTime(0.048 * scale, t);
    bg.gain.exponentialRampToValueAtTime(0.002, t + 0.12);
    bOsc.connect(lp);
    lp.connect(bg);
    bg.connect(this.ctx.destination);
    bOsc.start(t);
    bOsc.stop(t + 0.13);

    // Outrun arpeggio
    const arp = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 392.0];
    if (step % 2 === 0) {
      const aOsc = this.ctx.createOscillator();
      aOsc.type = 'triangle';
      aOsc.frequency.setValueAtTime(arp[(step / 2) % arp.length], t);
      const ag = this.ctx.createGain();
      ag.gain.setValueAtTime(0.036 * scale, t);
      ag.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
      aOsc.connect(ag);
      ag.connect(this.ctx.destination);
      aOsc.start(t);
      aOsc.stop(t + 0.2);
    }

    // 4-on-floor kick & gated 80s snare
    if (step % 4 === 0) {
      const k = this.ctx.createOscillator();
      k.type = 'sine';
      k.frequency.setValueAtTime(135, t);
      k.frequency.exponentialRampToValueAtTime(42, t + 0.13);
      const kg = this.ctx.createGain();
      kg.gain.setValueAtTime(0.095 * scale, t);
      kg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      k.connect(kg);
      kg.connect(this.ctx.destination);
      k.start(t);
      k.stop(t + 0.16);
    }
    if (this.noiseBuffer && (step === 4 || step === 12)) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1450, t);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.058 * scale, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(bp);
      bp.connect(ng);
      ng.connect(this.ctx.destination);
      src.start(t, 0.2, 0.2);
    }
  }

  public update(params: {
    dt: number;
    inCar: boolean;
    rpmRatio: number;
    throttle: boolean;
    nitroActive: boolean;
    isStorm: boolean;
    fuelCutActive?: boolean;
  }) {
    if (!this.ctx || !this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const engScale = this.masterVol * this.engineVol;
    const sfxScale = this.masterVol * this.sfxVol;

    if (this.engineOsc1 && this.engineOsc2 && this.engineFilter && this.engineGain) {
      if (params.inCar) {
        const clampedRatio = Math.min(1.15, Math.max(0, params.rpmRatio));
        const baseFreq = 44 + clampedRatio * 185 + (params.nitroActive ? 25 : 0);
        this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.03);
        this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.98, now, 0.03);
        this.engineFilter.frequency.setTargetAtTime(
          420 + clampedRatio * 1450 + (params.throttle && !params.fuelCutActive ? 450 : 0),
          now,
          0.04
        );
        // Clean electronic fuel-cut modulation when hitting limiter
        const baseVol = (params.throttle ? 0.088 : 0.036) * engScale;
        const vol = params.fuelCutActive ? baseVol * 0.24 : baseVol;
        this.engineGain.gain.setTargetAtTime(vol, now, params.fuelCutActive ? 0.015 : 0.05);
      } else {
        this.engineGain.gain.setTargetAtTime(0, now, 0.08);
      }
    }

    if (this.nitroGain) {
      this.nitroGain.gain.setTargetAtTime(
        params.inCar && params.nitroActive ? 0.14 * sfxScale : 0,
        now,
        0.04
      );
    }

    if (this.rainGain && this.rainFilter) {
      const baseRain = params.isStorm ? (params.inCar ? 0.2 : 0.09) : 0;
      const targetRainVol = baseRain * sfxScale;
      const targetRainFreq = params.inCar ? 1750 : 950;
      this.rainGain.gain.setTargetAtTime(targetRainVol, now, 0.3);
      this.rainFilter.frequency.setTargetAtTime(targetRainFreq, now, 0.2);
    }
  }

  /**
   * Realistic CDI Racing exhaust backfire pops & bangs (over-run crackle & rev-limit ignition cut)
   */
  public playBackfirePop(intensity = 1.0, exhaustStage = 0) {
    if (!this.ctx || !this.initialized || this.muted || !this.noiseBuffer) return;
    const scale = this.masterVol * this.engineVol;
    if (scale <= 0.01) return;

    const now = this.ctx.currentTime;
    const exBoost = 1 + Math.min(3, Math.max(0, exhaustStage)) * 0.12;
    const amp = Math.min(1.45, Math.max(0.4, intensity) * exBoost) * scale;

    const fireBurst = (startOffset: number, gainMult: number) => {
      const t = now + startOffset;

      // 1. Sharp crackle noise burst
      const noiseSrc = this.ctx!.createBufferSource();
      noiseSrc.buffer = this.noiseBuffer!;
      const bp = this.ctx!.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(720 + Math.random() * 680, t);
      bp.Q.value = 1.05;

      const ng = this.ctx!.createGain();
      ng.gain.setValueAtTime(0.001, t);
      ng.gain.linearRampToValueAtTime(0.32 * amp * gainMult, t + 0.005);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.095 + Math.random() * 0.05);

      noiseSrc.connect(bp);
      bp.connect(ng);
      ng.connect(this.ctx!.destination);
      noiseSrc.start(t, Math.random() * 0.8, 0.18);

      // 2. Deep low-end exhaust detonation thump
      const thump = this.ctx!.createOscillator();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(165 + Math.random() * 45, t);
      thump.frequency.exponentialRampToValueAtTime(38, t + 0.085);

      const tg = this.ctx!.createGain();
      tg.gain.setValueAtTime(0.22 * amp * gainMult, t);
      tg.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      thump.connect(tg);
      tg.connect(this.ctx!.destination);
      thump.start(t);
      thump.stop(t + 0.1);
    };

    fireBurst(0, 1.0);
    if (intensity >= 0.78 || exhaustStage >= 1) {
      fireBurst(0.045 + Math.random() * 0.03, 0.65);
    }
  }

  public playShiftBov() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.engineVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.14);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.065 * scale, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playNearMissChime(combo: number) {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    const pitch = Math.min(1100, 440 + combo * 55);
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.12);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.085 * scale, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playCrash() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.35);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.22 * scale, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playMissionComplete() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.075 * scale, now + idx * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.26);
    });
  }

  public playSpawnChime() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    [880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.06 * scale, now + idx * 0.065);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.14);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.15);
    });
  }

  public playEngineRevPreview(baseHp: number, cylinders: 'I4' | 'I6' | 'V8' | 'V10' | 'V12') {
    this.unlock();
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.engineVol;
    if (scale <= 0.01) return;

    const now = this.ctx.currentTime;
    const baseHz =
      cylinders === 'V12'
        ? 64
        : cylinders === 'V10'
          ? 58
          : cylinders === 'V8'
            ? 42
            : cylinders === 'I6'
              ? 52
              : 46;
    const harmonic = cylinders === 'V8' ? 1.5 : cylinders === 'V12' ? 2.5 : 2.0;
    const peakHz = baseHz * (2.6 + Math.min(1.4, baseHp / 650));

    const o1 = this.ctx.createOscillator();
    o1.type = 'sawtooth';
    const o2 = this.ctx.createOscillator();
    o2.type = cylinders === 'V8' ? 'sawtooth' : 'triangle';

    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(380, now);
    filt.frequency.exponentialRampToValueAtTime(2200, now + 0.55);
    filt.frequency.exponentialRampToValueAtTime(520, now + 1.35);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.11 * scale, now + 0.12);
    g.gain.setValueAtTime(0.11 * scale, now + 0.65);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.45);

    o1.frequency.setValueAtTime(baseHz, now);
    o1.frequency.exponentialRampToValueAtTime(peakHz, now + 0.55);
    o1.frequency.exponentialRampToValueAtTime(baseHz * 1.15, now + 1.4);

    o2.frequency.setValueAtTime(baseHz * harmonic, now);
    o2.frequency.exponentialRampToValueAtTime(peakHz * harmonic, now + 0.55);
    o2.frequency.exponentialRampToValueAtTime(baseHz * harmonic * 1.15, now + 1.4);

    o1.connect(filt);
    o2.connect(filt);
    filt.connect(g);
    g.connect(this.ctx.destination);
    o1.start(now);
    o2.start(now);
    o1.stop(now + 1.48);
    o2.stop(now + 1.48);
  }

  public playCashBank() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    [587.33, 880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.075 * scale, now + idx * 0.055);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.22);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.24);
    });
  }

  public playRadarFlash() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(2400, now);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.16 * scale, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      src.connect(hp);
      hp.connect(ng);
      ng.connect(this.ctx.destination);
      src.start(now, 0.05, 0.11);
    }
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(1960, now + 0.08);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.07 * scale, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playCheckpointChime(step: number) {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    const baseHz = 520 + Math.min(10, step) * 42;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseHz, now);
    osc.frequency.exponentialRampToValueAtTime(baseHz * 1.25, now + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.085 * scale, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playExtremeRoce() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(42, now + 0.28);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(0.18 * scale, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    sub.connect(sg);
    sg.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.31);

    const ping = this.ctx.createOscillator();
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(987.77, now);
    ping.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15);
    const pg = this.ctx.createGain();
    pg.gain.setValueAtTime(0.09 * scale, now);
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    ping.connect(pg);
    pg.connect(this.ctx.destination);
    ping.start(now);
    ping.stop(now + 0.24);
  }

  public playDuelChallenge() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      const lp = this.ctx!.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1800, now + idx * 0.08);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.06 * scale, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.22);
    });
  }

  public playLikeChime() {
    if (!this.ctx || !this.initialized || this.muted) return;
    const scale = this.masterVol * this.sfxVol;
    if (scale <= 0.01) return;
    const now = this.ctx.currentTime;
    [659.25, 987.77].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.075 * scale, now + idx * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  }

  public dispose() {
    if (this.radioTimer !== null) {
      window.clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
    try {
      this.engineOsc1?.stop();
      this.engineOsc2?.stop();
      this.ctx?.close();
    } catch {
      // ignore
    }
    this.initialized = false;
  }
}
