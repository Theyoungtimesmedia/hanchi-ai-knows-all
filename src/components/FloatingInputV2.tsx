import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Mic, Loader2, Send, Wand2, X, Image as ImageIcon, Sticker } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useImageUpload } from "@/hooks/useImageUpload";
import { EnhancedPlusMenu, ActiveAddons } from "./EnhancedPlusMenu";
import { AddonChips } from "./AddonChips";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  placeholder = "Message Hanchi..."
}: FloatingInputV2Props) => {
  const [input, setInput] = useState("");
  const [activeAddons, setActiveAddons] = useState<ActiveAddons>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { imagePreview, imageBase64, isUploading, handleImageUpload, clearImage } = useImageUpload();

  // Command detection for inline features
  const detectCommand = (text: string) => {
    const lower = text.toLowerCase().trim();
    if (lower.startsWith("generate image") || lower.startsWith("create image") || lower.startsWith("draw")) {
      return { type: "image", hint: "AI will generate an image from your description" };
    }
    if (lower.startsWith("create sticker") || lower.startsWith("make sticker") || lower.startsWith("generate sticker")) {
      return { type: "sticker", hint: "AI will create a sticker from your description" };
    }
    return null;
  };

  const command = detectCommand(input);

  const handleSubmit = () => {
    if (!input.trim() && !imageBase64) return;
    
    const images = imageBase64 ? [imageBase64] : undefined;
    onSend(input.trim(), images, activeAddons);
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
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
      title: enabled ? `${addonNames[addon]} enabled` : `${addonNames[addon]} disabled`,
      description: enabled ? "Active for your next message" : "",
    });
  };

  const handleRemoveAddon = (addon: keyof ActiveAddons) => {
    setActiveAddons(prev => ({ ...prev, [addon]: false }));
  };

  const handleAction = (action: string, data?: any) => {
    // Handle actions from plus menu
  };

  const hasContent = input.trim() || imageBase64;
  const activeAddonCount = Object.values(activeAddons).filter(Boolean).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      {/* Active Addons Chips */}
      <AddonChips activeAddons={activeAddons} onRemove={handleRemoveAddon} />

      {/* Command hint */}
      {command && (
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium animate-fade-in",
          command.type === "image" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
          command.type === "sticker" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        )}>
          {command.type === "image" ? <ImageIcon size={16} /> : <Sticker size={16} />}
          {command.hint}
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative bg-card rounded-2xl shadow-premium border border-border/50 transition-all duration-200 hover:border-border focus-within:border-primary/30 focus-within:shadow-lg">
        {/* Image Preview */}
        {imagePreview && (
          <div className="p-3 pb-0">
            <div className="relative inline-block">
              <img 
                src={imagePreview}
                alt="Upload preview" 
                className="h-20 w-20 rounded-xl object-cover border border-border"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs shadow-md hover:scale-110 transition-transform"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-2">
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

          {/* Input Field */}
          <div className="flex-1 relative">
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
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-4 px-2 text-foreground placeholder-muted-foreground text-base leading-relaxed max-h-[140px] scrollbar-thin"
              rows={1}
              style={{ minHeight: '56px' }}
            />
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center gap-1 pb-2">
            {/* Voice Recording Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-xl transition-all",
                isRecording 
                  ? 'text-destructive bg-destructive/10 animate-pulse' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
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
              className={cn(
                "h-10 w-10 rounded-xl transition-all",
                hasContent 
                  ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-105' 
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {disabled ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};
