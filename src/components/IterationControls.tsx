import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  MessageSquare, 
  Wand2,
  Languages,
  Lightbulb
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface IterationControlsProps {
  onIteration: (instruction: string) => void;
}

export const IterationControls = ({ onIteration }: IterationControlsProps) => {
  const controls = [
    {
      icon: ArrowDownToLine,
      label: "Shorter",
      instruction: "Make the previous response shorter and more concise",
    },
    {
      icon: ArrowUpFromLine,
      label: "Longer",
      instruction: "Expand on the previous response with more details and examples",
    },
    {
      icon: MessageSquare,
      label: "Formal",
      instruction: "Rewrite the previous response in formal Nigerian Standard English",
    },
    {
      icon: Wand2,
      label: "Casual",
      instruction: "Rewrite the previous response in casual, friendly Nigerian English",
    },
    {
      icon: Languages,
      label: "Pidgin",
      instruction: "Rewrite the previous response in Nigerian Pidgin",
    },
    {
      icon: Lightbulb,
      label: "Example",
      instruction: "Give a practical example to illustrate the previous response",
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {controls.map((control) => (
        <Tooltip key={control.label}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onIteration(control.instruction)}
            >
              <control.icon className="w-3 h-3 mr-1" />
              {control.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{control.instruction}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
