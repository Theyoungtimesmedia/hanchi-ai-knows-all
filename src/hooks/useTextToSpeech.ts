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

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language },
      });

      setIsFetching(false);

      if (error) throw error;

      setIsPlaying(true);
      playerRef.current.play(data.audioContent, () => {
        setIsPlaying(false);
      });
    } catch (error) {
      setIsFetching(false);
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
