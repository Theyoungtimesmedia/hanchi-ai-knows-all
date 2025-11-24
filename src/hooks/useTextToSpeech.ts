import { useState, useRef } from "react";
import { AudioPlayer } from "@/utils/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const playerRef = useRef<AudioPlayer>(new AudioPlayer());
  const { toast } = useToast();

  const speak = async (text: string, language: string) => {
    try {
      setIsFetching(true);

      console.log('Requesting TTS for:', text.substring(0, 50));

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language },
      });

      setIsFetching(false);

      if (error) {
        console.error('TTS error:', error);
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      console.log('TTS audio received, playing...');

      setIsPlaying(true);
      playerRef.current.play(data.audioContent, () => {
        setIsPlaying(false);
        console.log('Audio playback completed');
      }, () => {
        setIsPlaying(false);
        console.error('Audio playback failed');
        toast({
          title: "Playback Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      });
    } catch (error) {
      setIsFetching(false);
      console.error('TTS error:', error);
      toast({
        title: "Speech Error",
        description: error instanceof Error ? error.message : "Failed to generate speech",
        variant: "destructive",
      });
    }
  };

  const stop = () => {
    playerRef.current.stop();
    setIsPlaying(false);
  };

  return {
    isPlaying,
    isFetching,
    speak,
    stop,
  };
};
