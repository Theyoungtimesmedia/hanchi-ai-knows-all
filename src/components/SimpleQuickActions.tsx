import { ImagePlus, Sparkles, PenLine, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleQuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export const SimpleQuickActions = ({ onAction, disabled }: SimpleQuickActionsProps) => {
  const actions = [
    { 
      icon: ImagePlus, 
      label: "Create image", 
      prompt: "Generate an image of...",
      color: "text-green-600"
    },
    { 
      icon: Sparkles, 
      label: "Surprise me", 
      prompt: "Tell me something interesting about Nigeria",
      color: "text-blue-600"
    },
    { 
      icon: PenLine, 
      label: "Help me write", 
      prompt: "Help me write...",
      color: "text-purple-600"
    },
    { 
      icon: MoreHorizontal, 
      label: "More", 
      prompt: "more_options",
      color: "text-foreground"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
        >
          <action.icon className={`w-5 h-5 ${action.color}`} />
          <span className="text-sm font-medium text-foreground">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};
