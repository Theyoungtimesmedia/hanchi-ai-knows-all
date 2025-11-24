import {
  FileText,
  Languages,
  Code,
  BookOpen,
  Mail,
  FileEdit,
  Lightbulb,
  Calculator,
  Globe,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MoreOptionsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOption: (prompt: string) => void;
}

export const MoreOptionsMenu = ({
  open,
  onOpenChange,
  onSelectOption,
}: MoreOptionsMenuProps) => {
  const moreOptions = [
    {
      icon: Mail,
      label: "Write Email",
      description: "Compose professional or casual emails",
      prompt: "Help me write an email",
      color: "text-blue-600",
    },
    {
      icon: FileEdit,
      label: "Draft CV/Resume",
      description: "Create a CV in Nigerian format",
      prompt: "Help me create a professional CV",
      color: "text-green-600",
    },
    {
      icon: FileText,
      label: "Summarize Text",
      description: "Get concise summaries of articles or documents",
      prompt: "Summarize this text for me",
      color: "text-purple-600",
    },
    {
      icon: Languages,
      label: "Translate",
      description: "Translate between English, Hausa, and Pidgin",
      prompt: "Translate this text",
      color: "text-orange-600",
    },
    {
      icon: Code,
      label: "Code Help",
      description: "Debug, explain, or generate code",
      prompt: "Help me with this code",
      color: "text-cyan-600",
    },
    {
      icon: BookOpen,
      label: "Lesson Plan",
      description: "Create educational content and study plans",
      prompt: "Help me create a lesson plan",
      color: "text-pink-600",
    },
    {
      icon: FileText,
      label: "Write Essay",
      description: "Draft essays and academic papers",
      prompt: "Help me write an essay about",
      color: "text-indigo-600",
    },
    {
      icon: Lightbulb,
      label: "Brainstorm Ideas",
      description: "Generate creative ideas and solutions",
      prompt: "Help me brainstorm ideas for",
      color: "text-yellow-600",
    },
    {
      icon: Calculator,
      label: "Math Help",
      description: "Solve math problems and explain concepts",
      prompt: "Help me solve this math problem",
      color: "text-red-600",
    },
    {
      icon: Globe,
      label: "Research Topic",
      description: "Get information on any topic",
      prompt: "Tell me about",
      color: "text-teal-600",
    },
    {
      icon: Briefcase,
      label: "Business Plan",
      description: "Create business plans and strategies",
      prompt: "Help me create a business plan for",
      color: "text-amber-600",
    },
    {
      icon: FileText,
      label: "Write Article",
      description: "Draft articles and blog posts",
      prompt: "Help me write an article about",
      color: "text-violet-600",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>What can I help with?</DialogTitle>
          <DialogDescription>
            Choose a task to get started with Hanchi AI
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moreOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                onClick={() => {
                  onSelectOption(option.prompt);
                  onOpenChange(false);
                }}
                className="h-auto py-4 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2 w-full">
                  <option.icon className={`w-5 h-5 flex-shrink-0 ${option.color}`} />
                  <span className="text-sm font-semibold text-foreground text-left">
                    {option.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground text-left leading-tight">
                  {option.description}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
