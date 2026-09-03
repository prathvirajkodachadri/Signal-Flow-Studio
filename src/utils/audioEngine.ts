/**
 * Safe, lightweight Web Audio engine for real-time reference tones & level auditory preview
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlayingTone: boolean = false;
  private currentType: string = 'sine';

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(dbLevel: number, freq: number = 440, type: OscillatorType = 'sine') {
    try {
      this.init();
      if (!this.ctx) return;

      this.stopTone();

      // Convert dBFS to linear amplitude: 10^(db/20)
      const linearAmp = Math.max(0, Math.min(1, Math.pow(10, dbLevel / 20)));

      this.gainNode = this.ctx.createGain();
      // Ramp gain to avoid pop
      this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, linearAmp * 0.3), this.ctx.currentTime + 0.05);

      this.osc = this.ctx.createOscillator();
      this.osc.type = type;
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.osc.start();
      this.isPlayingTone = true;
      this.currentType = type;
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public updateToneLevel(dbLevel: number) {
    if (!this.gainNode || !this.ctx || !this.isPlayingTone) return;
    try {
      const linearAmp = Math.max(0, Math.min(1, Math.pow(10, dbLevel / 20)));
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(Math.max(0.0001, this.gainNode.gain.value), this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, linearAmp * 0.3), this.ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  public playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  public stopTone() {
    if (this.osc) {
      try {
        if (this.gainNode && this.ctx) {
          this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
          setTimeout(() => {
            this.osc?.stop();
            this.osc?.disconnect();
            this.osc = null;
          }, 60);
        } else {
          this.osc.stop();
          this.osc.disconnect();
          this.osc = null;
        }
      } catch {}
    }
    this.isPlayingTone = false;
  }

  public isPlaying(): boolean {
    return this.isPlayingTone;
  }
}

export const audioEngine = new AudioEngine();
