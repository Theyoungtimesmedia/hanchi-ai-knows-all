import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedMediaContext, TranscriptSegment } from "@/lib/media";

export interface MediaResult extends ProcessedMediaContext {}

export const useMediaUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaResult, setMediaResult] = useState<MediaResult | null>(null);
  const { toast } = useToast();

  const isSupportedFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    return (
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      file.type.startsWith('image/') ||
      file.type.startsWith('text/') ||
      ['application/pdf', 'application/json', 'text/csv'].includes(file.type) ||
      ['.opus', '.ogg', '.webm', '.mp3', '.wav', '.m4a', '.mp4', '.mov', '.avi', '.mkv', '.pdf', '.txt', '.md', '.json', '.csv'].some((ext) => lowerName.endsWith(ext))
    );
  };

  const processMediaUrl = async (url: string, language: string = 'en'): Promise<MediaResult | null> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-media', {
        body: { url, action: 'transcribe_link', language },
      });

      if (error) {
        throw new Error(error.message || 'Link transcription failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result: MediaResult = {
        text: data.text || '',
        summary: data.summary,
        analysis: data.analysis,
        type: data.type || 'link',
        sourceUrl: data.sourceUrl || url,
        title: data.title,
        provider: data.provider,
        transcriptSegments: (data.transcriptSegments || []) as TranscriptSegment[],
      };

      setMediaResult(result);
      toast({
        title: 'Link transcribed',
        description: 'Transcript and summary are ready before the AI reply.',
      });

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Link transcription failed';
      console.error('Media URL processing error:', msg);
      toast({
        title: 'Link Processing Failed',
        description: msg,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const processMedia = async (
    file: File,
    action: 'transcribe' | 'analyze' = 'transcribe',
    language: string = 'en'
  ): Promise<MediaResult | null> => {
    // Validate file type
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isSupportedFile(file)) {
      toast({
        title: "Unsupported file",
        description: "Please upload audio, video, image, or document files",
        variant: "destructive",
      });
      return null;
    }

    const maxSize = isAudio || isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${isAudio || isVideo ? '50MB' : '20MB'}`,
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
        text: data.text || '',
        summary: data.summary,
        analysis: data.analysis,
        extractedText: data.extractedText,
        title: data.title,
        provider: data.provider,
        sourceUrl: data.sourceUrl,
        transcriptSegments: (data.transcriptSegments || []) as TranscriptSegment[],
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
    processMediaUrl,
    clearResult,
  };
};
