export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onEndCallback?: () => void;
  private onErrorCallback?: () => void;

  play(base64Audio: string, onEnd?: () => void, onError?: () => void) {
    this.stop();
    
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    
    try {
      // Support multiple audio formats
      const audioFormat = this.detectAudioFormat(base64Audio);
      this.audio = new Audio(`data:audio/${audioFormat};base64,${base64Audio}`);
      
      console.log(`Playing audio (format: ${audioFormat}, size: ${base64Audio.length} bytes)`);
      
      this.audio.onended = () => {
        console.log('Audio playback ended');
        this.onEndCallback?.();
        this.cleanup();
      };

      this.audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        this.onErrorCallback?.();
        this.cleanup();
      };

      // Set volume to a reasonable level
      this.audio.volume = 0.8;

      this.audio.play().catch((error) => {
        console.error('Failed to start audio playback:', error);
        this.onErrorCallback?.();
        this.cleanup();
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      this.onErrorCallback?.();
      this.cleanup();
    }
  }

  private detectAudioFormat(base64Audio: string): string {
    // Try to detect format from base64 magic bytes
    const firstBytes = base64Audio.substring(0, 10);
    
    // MP3 magic bytes (ID3 or MPEG frame sync)
    if (firstBytes.includes('SUQz') || firstBytes.includes('//') || firstBytes.includes('AAAA')) {
      return 'mpeg';
    }
    
    // Default to mpeg (MP3)
    return 'mpeg';
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.cleanup();
    }
  }

  setVolume(volume: number) {
    if (this.audio && volume >= 0 && volume <= 1) {
      this.audio.volume = volume;
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
