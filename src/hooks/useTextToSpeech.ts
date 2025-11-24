import { useState, useRef, useEffect } from "react";
import { AudioPlayer } from "@/utils/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const playerRef = useRef<AudioPlayer>(new AudioPlayer());
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakWithWebAPI = (text: string, language: string) => {
    if (!synthRef.current) {
      throw new Error('Web Speech API not supported');
    }

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map language codes to appropriate voices
      const langMap: { [key: string]: string } = {
        'ha': 'en-GB', // Closest available for Hausa
        'en': 'en-NG', // Try Nigerian English first
        'pidgin': 'en-NG',
        'en-us': 'en-US'
      };
      
      utterance.lang = langMap[language] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsPlaying(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      synthRef.current!.cancel(); // Cancel any ongoing speech
      synthRef.current!.speak(utterance);
      setIsPlaying(true);
    });
  };

  const speak = async (text: string, language: string, register?: string) => {
    try {
      setIsFetching(true);

      console.log('Requesting TTS for:', text.substring(0, 50), 'Language:', language, 'Register:', register);

      // Try YarnGPT first (primary Nigerian voice provider)
      try {
        const { data, error } = await supabase.functions.invoke('yarngpt-tts', {
          body: { text, language, register: register || 'casual' },
        });

        setIsFetching(false);

        if (error) {
          console.warn('YarnGPT TTS failed, using Web Speech API fallback:', error);
          await speakWithWebAPI(text, language);
          return;
        }

        if (!data?.audioContent) {
          console.warn('No audio content from YarnGPT, using Web Speech API');
          await speakWithWebAPI(text, language);
          return;
        }

        console.log('YarnGPT TTS audio received, playing...');

        setIsPlaying(true);
        playerRef.current.play(data.audioContent, () => {
          setIsPlaying(false);
          console.log('Audio playback completed');
        }, () => {
          setIsPlaying(false);
          console.error('Audio playback failed, trying Web Speech API');
          speakWithWebAPI(text, language).catch(console.error);
        });
      } catch (yarngptError) {
        setIsFetching(false);
        console.warn('YarnGPT error, falling back to Web Speech API:', yarngptError);
        await speakWithWebAPI(text, language);
      }
    } catch (error) {
      setIsFetching(false);
      console.error('All TTS methods failed:', error);
      toast({
        title: "Speech Unavailable",
        description: "Text-to-speech is temporarily unavailable. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const stop = () => {
    playerRef.current.stop();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  return {
    isPlaying,
    isFetching,
    speak,
    stop,
  };
};
