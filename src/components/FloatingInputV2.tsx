import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Mic, Loader2, Send, Wand2 } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useImageUpload } from "@/hooks/useImageUpload";
import { EnhancedPlusMenu, ActiveAddons } from "./EnhancedPlusMenu";
import { AddonChips } from "./AddonChips";
import { useToast } from "@/hooks/use-toast";

interface FloatingInputV2Props {
  onSend: (message: string, images?: string[], addons?: ActiveAddons) => void;
  disabled?: boolean;
  language?: string;
  placeholder?: string;
}

export const FloatingInputV2 = ({ 
  onSend, 
  disabled, 
  language = "en",
  placeholder = "Ask Hanchi..."
}: FloatingInputV2Props) => {
  const [input, setInput] = useState("");
  const [activeAddons, setActiveAddons] = useState<ActiveAddons>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { imagePreview, imageBase64, isUploading, handleImageUpload, clearImage } = useImageUpload();

  // Check for inline image generation command
  const isImageCommand = (text: string) => {
    const lower = text.toLowerCase().trim();
    return lower.startsWith("generate image") || 
           lower.startsWith("create image") || 
           lower.startsWith("draw") ||
           lower.startsWith("make a picture") ||
           lower.startsWith("create sticker") ||
           lower.startsWith("generate sticker");
  };

  const handleSubmit = () => {
    if (!input.trim() && !imageBase64) return;
    
    const images = imageBase64 ? [imageBase64] : undefined;
    
    // Pass active addons with the message
    onSend(input.trim(), images, activeAddons);
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

  const handleToggleAddon = (addon: keyof ActiveAddons, enabled: boolean) => {
    setActiveAddons(prev => ({ ...prev, [addon]: enabled }));
    
    const addonNames: Record<keyof ActiveAddons, string> = {
      search: "Web Search",
      thinking: "Thinking Mode",
      jailbreak: "Unrestricted Mode",
      deepResearch: "Deep Research",
      study: "Study Mode",
    };
    
    toast({
      title: enabled ? `${addonNames[addon]} ON` : `${addonNames[addon]} OFF`,
      description: enabled ? "Active for your next message" : "Disabled",
    });
  };

  const handleRemoveAddon = (addon: keyof ActiveAddons) => {
    setActiveAddons(prev => ({ ...prev, [addon]: false }));
  };

  const handleAction = (action: string, data?: any) => {
    if (action === "image_generated" || action === "sticker_generated") {
      // Image was generated
    }
  };

  const hasContent = input.trim() || imageBase64;
  const showImageHint = isImageCommand(input);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Active Addons Chips */}
      <AddonChips activeAddons={activeAddons} onRemove={handleRemoveAddon} />

      {/* Image generation hint */}
      {showImageHint && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 text-xs">
          <Wand2 size={14} />
          <span>Image will be generated from your description</span>
        </div>
      )}

      <div className="bg-card rounded-full shadow-lg border border-border/50 flex items-center px-2 py-1.5">
        {/* Plus Menu Button */}
        <EnhancedPlusMenu
          disabled={disabled}
          activeAddons={activeAddons}
          onToggleAddon={handleToggleAddon}
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
          placeholder={placeholder}
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
