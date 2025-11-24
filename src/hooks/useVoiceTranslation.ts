import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVoiceTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translateVoice = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string | null> => {
    setIsTranslating(true);

    try {
      const startTime = Date.now();

      const { data, error } = await supabase.functions.invoke('translate-voice', {
        body: { text, sourceLang, targetLang },
      });

      const latency = Date.now() - startTime;
      console.log(`Translation latency: ${latency}ms`);

      if (error) throw error;

      setIsTranslating(false);
      return data.translatedText;
    } catch (error) {
      setIsTranslating(false);
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Failed to translate",
        variant: "destructive",
      });
      return null;
    }
  };

  return { isTranslating, translateVoice };
};
