import { Sparkles } from "lucide-react";

export const ThinkingIndicatorV2 = () => {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/30 rounded-lg border border-border/30 w-fit animate-fade-in">
      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">Thinking</span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
