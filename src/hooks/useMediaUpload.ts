import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MediaResult {
  text: string;
  analysis?: string;
  type: 'transcription' | 'analysis';
  fileName: string;
  fileType: string;
}

export const useMediaUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaResult, setMediaResult] = useState<MediaResult | null>(null);
  const { toast } = useToast();

  const processMedia = async (
    file: File,
    action: 'transcribe' | 'analyze' = 'transcribe',
    language: string = 'en'
  ): Promise<MediaResult | null> => {
    // Validate file type
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isAudio && !isVideo) {
      toast({
        title: "Unsupported file",
        description: "Please upload an audio or video file",
        variant: "destructive",
      });
      return null;
    }

    // Max 50MB for media
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum media file size is 50MB",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', action);
      formData.append('language', language);

      const { data, error } = await supabase.functions.invoke('process-media', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Processing failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result: MediaResult = {
        text: data.text,
        analysis: data.analysis,
        type: data.type,
        fileName: file.name,
        fileType: file.type,
      };

      setMediaResult(result);
      
      toast({
        title: action === 'analyze' ? "Analysis complete" : "Transcription complete",
        description: `${file.name} processed successfully`,
      });

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Processing failed";
      console.error('Media processing error:', msg);
      toast({
        title: "Processing Failed",
        description: msg,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResult = () => setMediaResult(null);

  return {
    isProcessing,
    mediaResult,
    processMedia,
    clearResult,
  };
};
