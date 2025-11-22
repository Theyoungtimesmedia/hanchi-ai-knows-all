import { useState } from "react";
import { ImageProcessor } from "@/utils/ImageProcessor";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    try {
      ImageProcessor.validateImageFile(file);

      // Create preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Compress and convert to base64
      const base64 = await ImageProcessor.compressImage(file);
      setImageBase64(base64);
    } catch (error) {
      toast({
        title: "Image Error",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageBase64(null);
  };

  return {
    imagePreview,
    imageBase64,
    handleImageUpload,
    clearImage,
  };
};
