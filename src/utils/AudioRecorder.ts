export interface RecordedAudioPayload {
  base64: string;
  mimeType: string;
  fileName: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private selectedMimeType = 'audio/webm';

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Prefer Opus codec for better quality and compression
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || 'audio/webm';
      this.selectedMimeType = mimeType.split(';')[0] || 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to access microphone. Please grant permission.');
    }
  }

  async stopRecording(): Promise<RecordedAudioPayload> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: this.selectedMimeType });
          const base64Audio = await this.blobToBase64(audioBlob);
          const extension = this.selectedMimeType.includes('ogg') ? 'ogg' : this.selectedMimeType.includes('mp4') ? 'm4a' : 'webm';
          
          // Clean up
          this.cleanup();
          
          resolve({
            base64: base64Audio,
            mimeType: this.selectedMimeType,
            fileName: `voice-recording.${extension}`,
          });
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.selectedMimeType = 'audio/webm';
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
