import { useState, useRef, KeyboardEvent } from "react";
import { Mic, Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useImageUpload } from "@/hooks/useImageUpload";
import { PlusMenu } from "./PlusMenu";

interface FloatingInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  language?: string;
  activeFeatures?: {
    thinking?: boolean;
    jailbreak?: boolean;
  };
  onToggleThinking?: (enabled: boolean) => void;
  onToggleJailbreak?: (enabled: boolean) => void;
}

export const FloatingInput = ({ 
  onSend, 
  disabled, 
  language = "en",
  activeFeatures = {},
  onToggleThinking,
  onToggleJailbreak
}: FloatingInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { imagePreview, imageBase64, isUploading, handleImageUpload, clearImage } = useImageUpload();

  const handleSubmit = () => {
    if (!input.trim() && !imageBase64) return;
    
    const images = imageBase64 ? [imageBase64] : undefined;
    onSend(input.trim(), images);
    setInput("");
    clearImage();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
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
      textareaRef.current.style.height = "52px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const handleAction = (action: string, data?: any) => {
    if (action === "web_search") {
      setInput("Search the web for: ");
      textareaRef.current?.focus();
    } else if (action === "study") {
      setInput(data || "Help me study and learn about ");
      textareaRef.current?.focus();
    } else if (action === "image_generated" || action === "sticker_generated") {
      // Image was generated, could add to message
    }
  };

  const hasContent = input.trim() || imageBase64;

  // Show active features indicator
  const hasActiveFeatures = activeFeatures.thinking || activeFeatures.jailbreak;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Active Features Indicator */}
      {hasActiveFeatures && (
        <div className="flex items-center gap-2 mb-2 justify-center">
          {activeFeatures.thinking && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              Thinking Mode
            </span>
          )}
          {activeFeatures.jailbreak && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Unrestricted
            </span>
          )}
        </div>
      )}

      <div className="bg-card rounded-full shadow-lg border border-border/50 flex items-center px-2 py-1.5">
        {/* Plus Menu Button */}
        <PlusMenu
          disabled={disabled}
          activeFeatures={activeFeatures}
          onToggleThinking={onToggleThinking}
          onToggleJailbreak={onToggleJailbreak}
          onImageUpload={handleImageClick}
          onFileUpload={handleImageClick}
          onAction={handleAction}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mx-2">
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

        {/* Input Field */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hanchi..."
          disabled={disabled}
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-3 px-3 text-foreground placeholder-muted-foreground text-sm max-h-[120px] scrollbar-thin"
          rows={1}
          style={{ minHeight: '52px' }}
        />
        
        {/* Voice Recording Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full transition-colors shrink-0 ${
            isRecording 
              ? 'text-destructive bg-destructive/10 animate-pulse' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          onClick={handleVoiceClick}
          disabled={isTranscribing || disabled}
          title={isRecording ? "Stop recording" : "Start voice input"}
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
          className={`h-10 w-10 rounded-full transition-all shrink-0 ${
            hasContent 
              ? 'bg-primary text-primary-foreground shadow-md hover:scale-105' 
              : 'bg-primary/50 text-primary-foreground/50'
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
