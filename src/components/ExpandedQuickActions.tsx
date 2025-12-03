import { 
  Mail, Code, FileText, Languages, PenTool, Lightbulb, 
  BookOpen, Briefcase, Calculator, Search, GraduationCap, 
  ImagePlus, MessageCircle, Sparkles, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface ExpandedQuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export const ExpandedQuickActions = ({ onAction, disabled }: ExpandedQuickActionsProps) => {
  const [open, setOpen] = useState(false);

  const categories = [
    {
      name: "Writing",
      icon: PenTool,
      actions: [
        { icon: Mail, label: "Write Email", prompt: "Help me write a professional email to ", color: "text-blue-500" },
        { icon: FileText, label: "Draft Essay", prompt: "Help me write an essay about ", color: "text-purple-500" },
        { icon: Briefcase, label: "Create CV", prompt: "Help me create a professional CV. My details: ", color: "text-green-500" },
        { icon: MessageCircle, label: "Social Post", prompt: "Help me write a social media post about ", color: "text-pink-500" },
      ]
    },
    {
      name: "Learning",
      icon: GraduationCap,
      actions: [
        { icon: BookOpen, label: "Lesson Plan", prompt: "Help me create a lesson plan for ", color: "text-amber-500" },
        { icon: GraduationCap, label: "WAEC/JAMB Help", prompt: "Help me prepare for WAEC/JAMB. Subject: ", color: "text-emerald-500" },
        { icon: Calculator, label: "Math Solver", prompt: "Solve this math problem step by step: ", color: "text-red-500" },
        { icon: Lightbulb, label: "Explain Concept", prompt: "Explain this concept simply: ", color: "text-yellow-500" },
      ]
    },
    {
      name: "Tech & Creative",
      icon: Code,
      actions: [
        { icon: Code, label: "Write Code", prompt: "Help me write code to ", color: "text-cyan-500" },
        { icon: ImagePlus, label: "Create Image", prompt: "Generate an image of ", color: "text-indigo-500" },
        { icon: Search, label: "Research", prompt: "Help me research about ", color: "text-orange-500" },
        { icon: Languages, label: "Translate", prompt: "Translate this to [Hausa/Pidgin/English]: ", color: "text-teal-500" },
      ]
    },
    {
      name: "Productivity",
      icon: Sparkles,
      actions: [
        { icon: FileText, label: "Summarize", prompt: "Summarize this text: ", color: "text-violet-500" },
        { icon: Lightbulb, label: "Brainstorm", prompt: "Help me brainstorm ideas for ", color: "text-lime-500" },
        { icon: Briefcase, label: "Business Plan", prompt: "Help me create a business plan for ", color: "text-rose-500" },
        { icon: Sparkles, label: "Improve Text", prompt: "Improve this text: ", color: "text-sky-500" },
      ]
    }
  ];

  const handleAction = (prompt: string) => {
    onAction(prompt);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">More options</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">👃🏿</span>
            What should Hanchi nose out?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <category.icon size={16} />
                {category.name}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {category.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.prompt)}
                    disabled={disabled}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted hover:border-primary/30 transition-all text-left group"
                  >
                    <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
