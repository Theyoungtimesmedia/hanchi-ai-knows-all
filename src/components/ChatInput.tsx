import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Image as ImageIcon, Loader2, X } from "lucide-react";
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
            className="absolute -top-2 -right-2 bg-background rounded-full"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <div className="relative flex items-end gap-2 p-4 bg-card border border-border rounded-2xl shadow-warm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0 hover:bg-muted"
            onClick={handleImageClick}
            disabled={disabled}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "flex-shrink-0 hover:bg-muted",
              isRecording && "text-destructive animate-pulse"
            )}
            onClick={handleVoiceClick}
            disabled={disabled || isTranscribing}
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isTranscribing ? "Transcribing..." : "Ask Hanchi anything..."}
          className="flex-1 min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent"
          disabled={disabled || isTranscribing}
        />

        <Button
          type="submit"
          size="icon"
          className={cn(
            "flex-shrink-0 bg-gradient-primary hover:opacity-90 transition-all",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={(!input.trim() && !imageBase64) || disabled || isTranscribing}
        >
          {disabled || isTranscribing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
};
