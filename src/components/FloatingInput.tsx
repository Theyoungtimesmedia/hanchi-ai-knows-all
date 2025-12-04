import { useState, useRef, KeyboardEvent } from "react";
import { Mic, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useImageUpload } from "@/hooks/useImageUpload";
import { PlusMenu } from "./PlusMenu";

interface FloatingInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  language?: string;
}

export const FloatingInput = ({ onSend, disabled, language = "en" }: FloatingInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { imagePreview, imageBase64, isUploading, handleImageUpload, clearImage } = useImageUpload();

  const handleSubmit = () => {
    if (!input.trim() && !imageBase64) return;
    
    const images = imageBase64 ? [imageBase64] : undefined;
    onSend(input.trim(), images);
    setInput("");
    clearImage();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case "thinking":
        setInput("Think step by step: ");
        textareaRef.current?.focus();
        break;
      case "deep_research":
        setInput("Research in detail: ");
        textareaRef.current?.focus();
        break;
      case "web_search":
        setInput("Search the web for: ");
        textareaRef.current?.focus();
        break;
      case "study":
        setInput("Help me learn about: ");
        textareaRef.current?.focus();
        break;
      case "add_files":
        fileInputRef.current?.click();
        break;
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const hasContent = input.trim() || imageBase64;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-full shadow-lg border border-border flex items-center px-2 py-1">
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.csv"
          className="hidden"
        />
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* + Button with Menu */}
        <PlusMenu
          onCameraClick={() => imageInputRef.current?.click()}
          onPhotosClick={() => imageInputRef.current?.click()}
          onFilesClick={() => fileInputRef.current?.click()}
          onAction={handleMenuAction}
          disabled={disabled}
        />

        {/* Input Field */}
        <div className="flex-1 flex items-center">
          {imagePreview && (
            <div className="relative mr-2">
              <img 
                src={imagePreview}
                alt="Upload preview" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px]"
              >
                ×
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Hanchi"
            disabled={disabled}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-3 px-2 text-foreground placeholder-muted-foreground text-base max-h-28 scrollbar-thin"
            rows={1}
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Voice Recording Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full transition-colors ${
            isRecording 
              ? 'text-destructive bg-destructive/10 animate-pulse' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          onClick={handleVoiceClick}
          disabled={isTranscribing || disabled}
        >
          {isTranscribing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Mic size={20} />
          )}
        </Button>
        
        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || !hasContent}
          size="icon"
          className={`h-10 w-10 rounded-full transition-all ${
            hasContent 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {disabled ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>
    </div>
  );
};
