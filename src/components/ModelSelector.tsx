import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ModelSelector = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border cursor-default">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Gemini 2.5 Flash</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          Fast, multilingual, Nigerian-optimized
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
