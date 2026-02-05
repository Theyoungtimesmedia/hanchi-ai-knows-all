import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  isSticker: boolean;
}

 // Enhanced natural language detection for image/sticker generation
 export const detectImageCommand = (text: string): { type: 'image' | 'sticker' | null; prompt: string } => {
   const lower = text.toLowerCase().trim();
   
   // Sticker patterns - more comprehensive natural language support
   const stickerPatterns = [
     // Slash commands
     /^\/sticker\s+(.+)/i,
     // Direct commands
     /^(?:create|generate|make|design)\s+(?:a\s+|an\s+)?(?:nigerian\s+)?sticker\s+(?:of\s+|for\s+|about\s+|showing\s+|with\s+)?(.+)/i,
     /^(?:i\s+)?(?:want|need)\s+(?:a\s+|an\s+)?sticker\s+(?:of\s+|for\s+|about\s+|showing\s+)?(.+)/i,
     /^(?:can\s+you\s+)?(?:make|create|design)\s+(?:me\s+)?(?:a\s+|an\s+)?sticker\s+(?:of\s+|for\s+)?(.+)/i,
     /^sticker\s+(?:of\s+|for\s+|about\s+)?(.+)/i,
   ];
   
   // Image patterns - comprehensive natural language support  
   const imagePatterns = [
     // Slash commands
     /^\/imagine\s+(.+)/i,
     /^\/image\s+(.+)/i,
     /^\/draw\s+(.+)/i,
     /^\/generate\s+(.+)/i,
     // Direct action commands
     /^(?:generate|create|make|draw|design|paint|render|produce)\s+(?:a\s+|an\s+)?(?:beautiful\s+|stunning\s+|amazing\s+|realistic\s+|artistic\s+)?(?:image|picture|photo|illustration|artwork|art|visual|graphic)\s+(?:of\s+|for\s+|about\s+|showing\s+|depicting\s+|with\s+)?(.+)/i,
     // Natural requests
     /^(?:i\s+)?(?:want|need|would\s+like)\s+(?:a\s+|an\s+)?(?:image|picture|photo|illustration)\s+(?:of\s+|for\s+|about\s+|showing\s+)?(.+)/i,
     /^(?:can\s+you\s+)?(?:make|create|draw|generate|design)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:image|picture|photo|illustration)\s+(?:of\s+|for\s+)?(.+)/i,
     /^(?:please\s+)?(?:show\s+me|visualize|illustrate)\s+(.+)/i,
     // Simple patterns
     /^draw\s+(?:me\s+)?(?:a\s+|an\s+)?(.+)/i,
     /^paint\s+(?:me\s+)?(?:a\s+|an\s+)?(.+)/i,
     /^imagine\s+(.+)/i,
     // "image of X" pattern
     /^(?:an?\s+)?(?:image|picture|photo)\s+(?:of\s+|showing\s+)(.+)/i,
   ];
   
   // Check sticker patterns first (more specific)
   for (const pattern of stickerPatterns) {
     const match = text.match(pattern);
     if (match && match[1]) {
       return { type: 'sticker', prompt: match[1].trim() };
     }
   }
   
   // Then check image patterns
   for (const pattern of imagePatterns) {
     const match = text.match(pattern);
     if (match && match[1]) {
       return { type: 'image', prompt: match[1].trim() };
     }
   }
   
   return { type: null, prompt: '' };
 };

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
        title: isSticker ? "Sticker created! 🎨" : "Image generated! 🎨",
        description: "Hanchi has nosed out your creation",
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
    detectImageCommand,
  };
};
