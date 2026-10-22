class SoundService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Soft UI click
  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Dice roll clack sequence
  public playDiceRoll() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const clicks = 6;
    for (let i = 0; i < clicks; i++) {
      const time = this.ctx.currentTime + i * 0.08 + Math.random() * 0.03;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + Math.random() * 200, time);
      
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  // Correct answer bright major chord chime
  public playCorrect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  // Wrong answer soft low buzz
  public playWrong() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.29);
  }

  // Ascending cheerful ladder climb
  public playLadderClimb() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77]; // E4..B5
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.16, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(time);
      osc.stop(time + 0.16);
    });
  }

  // Descending slide whistle effect for snake
  public playSnakeSlide() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.62);
  }

  // Step movement tick
  public playStep() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Grand victory fanfare
  public playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Victory progression: C4, E4, G4, C5 (hold), G4, C5!
    const sequence = [
      { f: 523.25, d: 0.14, pause: 0 },
      { f: 523.25, d: 0.14, pause: 0.16 },
      { f: 523.25, d: 0.14, pause: 0.32 },
      { f: 659.25, d: 0.40, pause: 0.50 },
      { f: 587.33, d: 0.20, pause: 0.95 },
      { f: 659.25, d: 0.20, pause: 1.18 },
      { f: 783.99, d: 0.65, pause: 1.40 },
    ];

    sequence.forEach((note) => {
      const startTime = this.ctx!.currentTime + note.pause;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + note.d + 0.05);
    });
  }
}

export const soundManager = new SoundService();
