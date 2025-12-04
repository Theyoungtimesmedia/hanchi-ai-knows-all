import { useState } from "react";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

interface ThinkBeforeTalkToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  thought?: string;
  isThinking?: boolean;
}

export const ThinkBeforeTalkToggle = ({
  enabled,
  onToggle,
  thought,
  isThinking
}: ThinkBeforeTalkToggleProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto mb-4">
      {/* Toggle Button */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Brain size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Think Before I Talk 👃</h4>
            <p className="text-xs text-muted-foreground">
              {enabled ? "Hanchi will show reasoning process" : "Enable to see how Hanchi thinks"}
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      {/* Thinking Panel */}
      {enabled && (thought || isThinking) && (
        <div className="mt-2 bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg animate-pulse">👃</span>
              <span className="text-sm font-medium text-foreground">
                {isThinking ? "Nosing it out..." : "What Hanchi sniffed out"}
              </span>
            </div>
            {expanded ? (
              <ChevronUp size={18} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={18} className="text-muted-foreground" />
            )}
          </button>
          
          {expanded && (
            <div className="px-4 pb-4 border-t border-primary/10">
              {isThinking ? (
                <div className="py-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-sm text-muted-foreground ml-2">Analyzing your question...</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mt-3">
                    <p>🔍 Checking Nigerian knowledge base...</p>
                    <p>📚 Looking for relevant context...</p>
                    <p>🧠 Formulating response...</p>
                  </div>
                </div>
              ) : thought ? (
                <div className="py-3">
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <h5 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                      <Brain size={12} /> Hanchi's Thought Process
                    </h5>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{thought}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
