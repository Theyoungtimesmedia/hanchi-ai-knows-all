import { useState, useRef, KeyboardEvent } from "react";
import { Send, Mic, Image as ImageIcon, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useImageUpload } from "@/hooks/useImageUpload";

interface FloatingInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  language?: string;
}

export const FloatingInput = ({ onSend, disabled, language = "en" }: FloatingInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { imagePreview, imageBase64, handleImageUpload, clearImage } = useImageUpload();

  const handleSubmit = () => {
    if (!input.trim() && !imageBase64) return;
    
    const images = imageBase64 ? [imageBase64] : undefined;
    onSend(input.trim(), images);
    setInput("");
    clearImage();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceClick = async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        setInput(prev => prev + (prev ? " " : "") + text);
      }
    } else {
      startRecording();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px";
    }
  };

  const hasContent = input.trim() || imageBase64;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-[2rem] shadow-xl border border-border/50 p-2 flex flex-col">
        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 pt-2 pb-1">
            <div className="relative inline-block">
              <img 
                src={imagePreview}
                alt="Upload preview" 
                className="h-20 rounded-xl object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="flex items-end gap-2 px-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe your idea..."
            disabled={disabled}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-4 px-3 text-foreground placeholder-muted-foreground text-base max-h-32 scrollbar-thin"
            rows={1}
            style={{ minHeight: '56px' }}
          />
          
          <Button
            onClick={handleSubmit}
            disabled={disabled || !hasContent}
            size="icon"
            className={`mb-2 rounded-full transition-all duration-300 ${
              hasContent 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {disabled ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 pb-2 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={handleImageClick}
              disabled={isUploading || disabled}
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ImageIcon size={18} />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full transition-colors ${
                isRecording 
                  ? 'text-destructive bg-destructive/10' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
              onClick={handleVoiceClick}
              disabled={isTranscribing || disabled}
            >
              {isTranscribing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Mic size={18} />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              disabled={disabled}
            >
              <Search size={18} />
            </Button>
          </div>
          
          <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide uppercase">
            Hanchi AI 2.0
          </span>
        </div>
      </div>
    </div>
  );
};
