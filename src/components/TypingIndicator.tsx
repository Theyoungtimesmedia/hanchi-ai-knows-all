import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export const TypingIndicator = () => {
  const [dots, setDots] = useState("");
  const [phase, setPhase] = useState<"thinking" | "searching" | "responding">("thinking");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    const phaseInterval = setInterval(() => {
      setPhase((prev) => {
        if (prev === "thinking") return "searching";
        if (prev === "searching") return "responding";
        return "thinking";
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(phaseInterval);
    };
  }, []);

  const getPhaseText = () => {
    switch (phase) {
      case "thinking": return "Thinking";
      case "searching": return "Searching";
      case "responding": return "Writing";
      default: return "Thinking";
    }
  };

  return (
    <div className="flex items-center gap-2.5 p-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
      </div>
      <div className="flex-1">
        <div className="bg-card border border-border/40 rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground animate-pulse">
            {getPhaseText()}{dots}
          </p>
        </div>
      </div>
    </div>
  );
};
