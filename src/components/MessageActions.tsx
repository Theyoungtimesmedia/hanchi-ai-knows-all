import { Copy, Volume2, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  isAssistant: boolean;
}

export const MessageActions = ({ content, onRegenerate, onSpeak, isAssistant }: MessageActionsProps) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast({
      title: "Thank you!",
      description: "Your feedback helps us improve",
    });
  };

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
      >
        <Copy className="w-3 h-3" />
      </Button>
      
      {onSpeak && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onSpeak}
        >
          <Volume2 className="w-3 h-3" />
        </Button>
      )}

      {isAssistant && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleFeedback("up")}
            disabled={feedback !== null}
          >
            <ThumbsUp className={`w-3 h-3 ${feedback === "up" ? "fill-primary text-primary" : ""}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleFeedback("down")}
            disabled={feedback !== null}
          >
            <ThumbsDown className={`w-3 h-3 ${feedback === "down" ? "fill-destructive text-destructive" : ""}`} />
          </Button>

          {onRegenerate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRegenerate}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
