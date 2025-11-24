import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export const TypingIndicator = () => {
  const [dots, setDots] = useState("");
  const [phase, setPhase] = useState<"thinking" | "searching" | "responding">("thinking");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Simulate different phases
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
      case "thinking":
        return "Nosing out answers";
      case "searching":
        return "Searching Nigerian context";
      case "responding":
        return "Crafting response";
      default:
        return "Thinking";
    }
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
      </div>
      <div className="flex-1">
        <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
          <p className="text-sm text-muted-foreground animate-pulse">
            {getPhaseText()}{dots}
          </p>
        </div>
      </div>
    </div>
  );
};
