export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onEndCallback?: () => void;

  play(base64Audio: string, onEnd?: () => void) {
    this.stop();
    
    this.onEndCallback = onEnd;
    this.audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    
    this.audio.onended = () => {
      this.onEndCallback?.();
      this.cleanup();
    };

    this.audio.onerror = () => {
      console.error('Error playing audio');
      this.cleanup();
    };

    this.audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
      this.cleanup();
    });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio = null;
    }
  }

  isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused;
  }
}
