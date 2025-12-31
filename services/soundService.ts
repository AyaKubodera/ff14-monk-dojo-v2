
class SoundService {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // ブラウザの制限を解除するために空の音を鳴らす
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick(freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.1) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSuccess() {
    this.playClick(660, 'triangle', 0.15);
    setTimeout(() => this.playClick(880, 'triangle', 0.2), 50);
  }

  playError() {
    this.playClick(150, 'sawtooth', 0.3);
  }

  playSkill() {
    this.playClick(500, 'sine', 0.08);
  }
}

export const sounds = new SoundService();
