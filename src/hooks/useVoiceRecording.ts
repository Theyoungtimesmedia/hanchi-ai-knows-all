import { useState, useRef } from "react";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVoiceRecording = (language: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }
      await recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: error instanceof Error ? error.message : "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recorderRef.current) return null;

    try {
      setIsRecording(false);
      setIsTranscribing(true);

      const base64Audio = await recorderRef.current.stopRecording();

      // Transcribe using edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio, language },
      });

      setIsTranscribing(false);

      if (error) {
        console.error('Transcription error:', error);
        if (error.message?.includes('Rate limit')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        if (error.message?.includes('Credits')) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
        throw error;
      }

      return data.text || null;
    } catch (error) {
      setIsTranscribing(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to transcribe audio";
      console.error('Transcription failed:', errorMessage);
      toast({
        title: "Transcription Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
  };
};
