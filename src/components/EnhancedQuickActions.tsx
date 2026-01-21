import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Mail,
  Calculator,
  Languages,
  FileText,
  Code,
  MessageSquare,
  Search,
  Lightbulb,
  BookOpen,
  Briefcase,
  Music,
  X,
} from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <Mail className="w-4 h-4" />,
    label: "Write Email",
    prompt: "Help me write a professional email to apply for a job. I'll tell you the details.",
    color: "text-blue-500",
  },
  {
    icon: <Calculator className="w-4 h-4" />,
    label: "Solve Math",
    prompt: "Help me solve this math problem step by step:",
    color: "text-green-500",
  },
  {
    icon: <Languages className="w-4 h-4" />,
    label: "Translate",
    prompt: "Translate this text for me:",
    color: "text-purple-500",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: "Summarize",
    prompt: "Summarize this text in bullet points:",
    color: "text-orange-500",
  },
  {
    icon: <Code className="w-4 h-4" />,
    label: "Write Code",
    prompt: "Write code to help me:",
    color: "text-cyan-500",
  },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "WhatsApp",
    prompt: "Help me draft a WhatsApp message to:",
    color: "text-emerald-500",
  },
  {
    icon: <Search className="w-4 h-4" />,
    label: "Research",
    prompt: "Search the web and find information about:",
    color: "text-indigo-500",
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    label: "Brainstorm",
    prompt: "Brainstorm ideas for:",
    color: "text-yellow-500",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    label: "Study Help",
    prompt: "Help me study for my exam in:",
    color: "text-rose-500",
  },
  {
    icon: <Briefcase className="w-4 h-4" />,
    label: "Business Plan",
    prompt: "Help me create a business plan for:",
    color: "text-slate-500",
  },
  {
    icon: <Music className="w-4 h-4" />,
    label: "Creative",
    prompt: "Write a creative piece for me:",
    color: "text-pink-500",
  },
];

interface EnhancedQuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export function EnhancedQuickActions({ onAction, disabled }: EnhancedQuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-card hover:bg-muted border-border/50 rounded-xl text-left"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">More</span>
      </Button>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    onAction(action.prompt);
                    setIsExpanded(false);
                  }}
                  disabled={disabled}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  <div className={action.color}>{action.icon}</div>
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
