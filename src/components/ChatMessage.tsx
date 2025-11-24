import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { MessageActions } from "./MessageActions";
import { SourcesDisplay } from "./SourcesDisplay";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { MarkdownMessage } from "./MarkdownMessage";
import { SmartReplySuggestions } from "./SmartReplySuggestions";
import { IterationControls } from "./IterationControls";

interface Source {
  title: string;
  url?: string;
  snippet?: string;
  timestamp?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  language: string;
  images?: string[];
  confidence?: number;
  sources?: Source[];
  onRegenerate?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  onIteration?: (instruction: string) => void;
  onEdit?: () => void;
}

export const ChatMessage = ({ 
  role, 
  content, 
  language, 
  images, 
  confidence,
  sources,
  onRegenerate,
  onSuggestionClick,
  onIteration,
  onEdit,
}: ChatMessageProps) => {
  const isAssistant = role === "assistant";
  const { isPlaying, speak, stop } = useTextToSpeech();

  const handleSpeakClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(content, language);
    }
  };

  // Detect message type for smart suggestions
  const detectMessageType = (): 'code' | 'text' | 'list' | 'table' | 'explanation' => {
    if (content.includes('```') || content.includes('function') || content.includes('const ')) {
      return 'code';
    }
    if (content.includes('|') && content.split('\n').filter(line => line.includes('|')).length > 2) {
      return 'table';
    }
    if (content.match(/^\d+\.|^[-*•]/m)) {
      return 'list';
    }
    return 'explanation';
  };

  return (
    <div
      className={cn(
        "group flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
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
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div
              className={cn(
                "rounded-2xl px-4 py-3 flex-1 max-w-[85%]",
                isAssistant
                  ? "bg-muted/40 text-foreground"
                  : "bg-primary/10 text-foreground"
              )}
            >
              <div className="space-y-2">
                {isAssistant && confidence && (
                  <div className="flex items-center justify-between mb-2">
                    <ConfidenceBadge confidence={confidence} />
                  </div>
                )}
                <div className="text-sm">
                  {isAssistant ? (
                    <MarkdownMessage content={content} />
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
                  )}
                </div>
              </div>
            </div>

            {isAssistant && (
              <MessageActions
                content={content}
                onSpeak={handleSpeakClick}
                onRegenerate={onRegenerate}
                isAssistant={true}
              />
            )}
            {!isAssistant && onEdit && (
              <MessageActions
                content={content}
                onEdit={onEdit}
                isAssistant={false}
              />
            )}
          </div>

          {isAssistant && onIteration && (
            <IterationControls onIteration={onIteration} />
          )}

          {isAssistant && sources && sources.length > 0 && (
            <div className="ml-11">
              <SourcesDisplay sources={sources} />
            </div>
          )}

          {isAssistant && onSuggestionClick && (
            <SmartReplySuggestions
              lastMessage={content}
              messageType={detectMessageType()}
              onSuggestionClick={onSuggestionClick}
            />
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};
