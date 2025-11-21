import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onVoiceClick?: () => void;
  onImageClick?: () => void;
}

export const ChatInput = ({ onSend, disabled, onVoiceClick, onImageClick }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
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
      <div className="relative flex items-end gap-2 p-4 bg-card border border-border rounded-2xl shadow-warm">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0 hover:bg-muted"
            onClick={onImageClick}
            disabled={disabled}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0 hover:bg-muted"
            onClick={onVoiceClick}
            disabled={disabled}
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hanchi anything..."
          className="flex-1 min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent"
          disabled={disabled}
        />

        <Button
          type="submit"
          size="icon"
          className={cn(
            "flex-shrink-0 bg-gradient-primary hover:opacity-90 transition-all",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={!input.trim() || disabled}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
};
