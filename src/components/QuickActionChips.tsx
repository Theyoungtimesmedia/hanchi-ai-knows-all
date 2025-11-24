import { MessageSquare, Languages, Code, FileText, Calculator, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionChipsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickActionChips = ({ onAction, disabled }: QuickActionChipsProps) => {
  const actions = [
    { icon: Languages, label: "Translate", prompt: "Help me translate this text" },
    { icon: Calculator, label: "Math Help", prompt: "Help me solve this math problem" },
    { icon: FileText, label: "Summarize", prompt: "Summarize this document for me" },
    { icon: Code, label: "Code Help", prompt: "Help me with this code" },
    { icon: MessageSquare, label: "Explain", prompt: "Explain this concept to me" },
    { icon: Search, label: "Research", prompt: "Research this topic for me" },
  ];

  return (
    <div className="flex gap-2 flex-wrap mb-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          className="gap-2 text-xs h-8 bg-muted/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
        >
          <action.icon className="w-3 h-3" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};
