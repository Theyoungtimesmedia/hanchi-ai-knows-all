import { 
  Mail, Code, FileText, Languages, PenTool, Lightbulb, 
  BookOpen, Briefcase, Calculator, Search, GraduationCap, 
  ImagePlus, MessageCircle, Sparkles, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
        { icon: Mail, label: "Write Email", prompt: "Help me write a professional email. What would you like me to write about?", color: "text-blue-500" },
        { icon: FileText, label: "Draft Essay", prompt: "Help me write an essay. What topic would you like me to cover?", color: "text-purple-500" },
        { icon: Briefcase, label: "Create CV", prompt: "Help me create a professional CV/Resume. Please share your experience and skills.", color: "text-green-500" },
        { icon: MessageCircle, label: "Social Post", prompt: "Help me write an engaging social media post. What platform and topic?", color: "text-pink-500" },
      ]
    },
    {
      name: "Learning",
      icon: GraduationCap,
      actions: [
        { icon: BookOpen, label: "Lesson Plan", prompt: "Help me create a lesson plan. What subject and topic would you like to teach?", color: "text-amber-500" },
        { icon: GraduationCap, label: "WAEC/JAMB Help", prompt: "I need help preparing for WAEC/JAMB exams. Which subject do you need help with?", color: "text-emerald-500" },
        { icon: Calculator, label: "Math Solver", prompt: "Help me solve a math problem. What equation or problem do you need help with?", color: "text-red-500" },
        { icon: Lightbulb, label: "Explain Concept", prompt: "Help me understand a concept. What topic would you like me to explain simply?", color: "text-yellow-500" },
      ]
    },
    {
      name: "Tech & Creative",
      icon: Code,
      actions: [
        { icon: Code, label: "Write Code", prompt: "Help me write code. What programming language and what would you like me to build?", color: "text-cyan-500" },
        { icon: ImagePlus, label: "Create Image", prompt: "Generate an image for me. Describe what you'd like to see.", color: "text-indigo-500" },
        { icon: Search, label: "Research", prompt: "Help me research a topic. What would you like me to find information about?", color: "text-orange-500" },
        { icon: Languages, label: "Translate", prompt: "Help me translate text. What language would you like to translate from and to?", color: "text-teal-500" },
      ]
    },
    {
      name: "Productivity",
      icon: Sparkles,
      actions: [
        { icon: FileText, label: "Summarize", prompt: "Help me summarize content. Paste the text you'd like me to summarize.", color: "text-violet-500" },
        { icon: Lightbulb, label: "Brainstorm", prompt: "Help me brainstorm ideas. What topic or problem would you like to explore?", color: "text-lime-500" },
        { icon: Briefcase, label: "Business Plan", prompt: "Help me create a business plan. What type of business are you planning?", color: "text-rose-500" },
        { icon: Sparkles, label: "Improve Text", prompt: "Help me improve my writing. Paste the text you'd like me to enhance.", color: "text-sky-500" },
      ]
    }
  ];

  const handleAction = (prompt: string) => {
    onAction(prompt);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-foreground" />
          <span className="text-sm font-medium text-foreground">More</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto pb-8">
        {/* Handle bar */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-2xl">👃🏿</span>
            What should Hanchi nose out?
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
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
      </SheetContent>
    </Sheet>
  );
};
