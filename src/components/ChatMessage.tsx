import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { MessageActions } from "./MessageActions";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  language: string;
  images?: string[];
  onRegenerate?: () => void;
}

export const ChatMessage = ({ role, content, language, images, onRegenerate }: ChatMessageProps) => {
  const isAssistant = role === "assistant";
  const { isPlaying, speak, stop } = useTextToSpeech();

  const handleSpeakClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(content, language);
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className="flex-1 max-w-[80%] flex flex-col gap-1">
        {images && images.length > 0 && (
          <div className="space-y-2">
            {images.map((img, index) => (
              <img
                key={index}
                src={`data:image/jpeg;base64,${img}`}
                alt="Uploaded"
                className="max-w-full rounded-xl border border-border shadow-sm"
              />
            ))}
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              isAssistant
                ? "bg-card border border-border shadow-sm"
                : "bg-gradient-secondary text-secondary-foreground shadow-accent"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>

          {isAssistant && (
            <MessageActions
              content={content}
              onSpeak={handleSpeakClick}
              onRegenerate={onRegenerate}
              isAssistant={true}
            />
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-secondary flex items-center justify-center shadow-accent">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
