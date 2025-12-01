import { Loader2 } from "lucide-react";

export const ThinkingIndicatorV2 = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl shadow-sm border border-primary/10 w-fit mb-4 animate-fade-in">
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm font-medium text-primary">
        Hanchi is nosing out the answer...
      </span>
    </div>
  );
};
