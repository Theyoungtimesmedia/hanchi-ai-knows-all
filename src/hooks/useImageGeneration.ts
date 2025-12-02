import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  isSticker: boolean;
}

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const { toast } = useToast();

  const generateImage = useCallback(async (
    prompt: string, 
    style: "default" | "nigerian" | "sticker" | "professional" | "creative" = "default",
    isSticker = false
  ) => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the image",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style, isSticker }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Image generation failed");
      }

      const image: GeneratedImage = {
        url: data.image_url,
        prompt: data.prompt,
        style: data.style,
        isSticker: data.isSticker,
      };

      setGeneratedImage(image);
      
      toast({
        title: "Image generated! 🎨",
        description: "Hanchi has nosed out your image",
      });

      return image;
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  return {
    isGenerating,
    generatedImage,
    generateImage,
    clearImage,
  };
};
