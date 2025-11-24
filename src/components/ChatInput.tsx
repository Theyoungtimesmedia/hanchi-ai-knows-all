import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic, Plus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  language: string;
}

export const ChatInput = ({ onSend, disabled, language }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { imagePreview, imageBase64, handleImageUpload, clearImage } = useImageUpload();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || imageBase64) && !disabled) {
      onSend(input.trim() || "What's in this image?", imageBase64 ? [imageBase64] : undefined);
      setInput("");
      clearImage();
    }
  };

  const handleVoiceClick = async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        setInput(prev => prev + (prev ? " " : "") + text);
      }
    } else {
      await startRecording();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 bg-background rounded-full shadow-md"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-3 max-w-3xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 hover:bg-muted rounded-full"
          onClick={handleImageClick}
          disabled={disabled}
        >
          <Plus className="w-5 h-5" />
        </Button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isTranscribing ? "Transcribing..." : "Ask Hanchi AI"}
          className="flex-1 bg-input rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-0"
          disabled={disabled || isTranscribing}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "flex-shrink-0 hover:bg-muted rounded-full",
            isRecording && "text-destructive animate-pulse"
          )}
          onClick={handleVoiceClick}
          disabled={disabled || isTranscribing}
        >
          <Mic className="w-5 h-5" />
        </Button>

        <Button
          type="submit"
          size="icon"
          className={cn(
            "flex-shrink-0 bg-primary hover:bg-primary/90 rounded-full",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={(!input.trim() && !imageBase64) || disabled || isTranscribing}
        >
          {disabled || isTranscribing ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
          ) : (
            <Send className="w-4 h-4 text-primary-foreground" />
          )}
        </Button>
      </div>
    </form>
  );
};
