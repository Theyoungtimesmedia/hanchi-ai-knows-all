import { cn } from "@/lib/utils";
import { Bot, User, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  language: string;
  images?: string[];
}

export const ChatMessage = ({ role, content, language, images }: ChatMessageProps) => {
  const isAssistant = role === "assistant";
  const { isPlaying, isFetching, speak, stop } = useTextToSpeech();

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
        "flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-warm">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isAssistant
            ? "bg-card border border-border"
            : "bg-gradient-primary text-primary-foreground"
        )}
      >
        {images && images.length > 0 && (
          <div className="mb-2 space-y-2">
            {images.map((img, index) => (
              <img
                key={index}
                src={`data:image/jpeg;base64,${img}`}
                alt="Uploaded"
                className="max-w-full rounded-lg"
              />
            ))}
          </div>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        
        {isAssistant && content && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-6 px-2"
            onClick={handleSpeakClick}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-secondary flex items-center justify-center shadow-sm">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
