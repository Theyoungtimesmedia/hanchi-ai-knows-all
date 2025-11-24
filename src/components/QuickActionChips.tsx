import { Mail, Code, FileText, Languages, PenTool, Lightbulb, BookOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionChipsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickActionChips = ({ onAction, disabled }: QuickActionChipsProps) => {
  const actions = [
    { icon: Mail, label: "Write Email", prompt: "Help me write a professional email" },
    { icon: Briefcase, label: "Draft CV", prompt: "Help me create a CV" },
    { icon: FileText, label: "Summarize", prompt: "Summarize this article for me" },
    { icon: Languages, label: "Translate", prompt: "Help me translate this text" },
    { icon: Code, label: "Code Help", prompt: "Help me write code" },
    { icon: BookOpen, label: "Lesson Plan", prompt: "Help me create a lesson plan" },
    { icon: PenTool, label: "Write Essay", prompt: "Help me write an essay" },
    { icon: Lightbulb, label: "Brainstorm", prompt: "Help me brainstorm ideas" },
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
