import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
  text?: string; // extracted text for text files
  isMedia?: boolean; // audio or video file
}

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<void> => {
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const base64 = await fileToBase64(file);
      let extractedText: string | undefined;

      // Extract text for text-based files
      if (isTextFile(file.type)) {
        extractedText = await extractTextFromFile(file);
      }

      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        text: extractedText,
      };

      setFiles((prev) => [...prev, uploadedFile]);

      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    files,
    isProcessing,
    uploadFile,
    removeFile,
    clearFiles,
  };
};

// Helper functions
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const isTextFile = (mimeType: string): boolean => {
  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/javascript' ||
    mimeType.includes('xml')
  );
};

const extractTextFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
