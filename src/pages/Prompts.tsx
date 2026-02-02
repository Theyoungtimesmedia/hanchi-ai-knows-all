import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ArrowLeft, Search, Code, 
  MessageSquare, Sparkles, PenTool, GraduationCap,
  TrendingUp, Heart, Music, Edit3, Send, Copy, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptTemplate {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
  category: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Writing
  { 
    id: "email-formal", 
    icon: <MessageSquare size={20} />,
    title: "Professional Email", 
    description: "Write a formal business email",
    prompt: "Write a professional email for the following situation. Make it clear, concise, and appropriately formal:\n\n[Describe your situation here]",
    category: "writing"
  },
  { 
    id: "email-job", 
    icon: <TrendingUp size={20} />,
    title: "Job Application", 
    description: "Apply for a job position",
    prompt: "Write a compelling job application email for the position of [JOB TITLE] at [COMPANY]. Highlight my experience in [YOUR SKILLS] and my passion for [INDUSTRY/FIELD].",
    category: "writing"
  },
  { 
    id: "cv-writer", 
    icon: <PenTool size={20} />,
    title: "CV/Resume Helper", 
    description: "Improve your CV content",
    prompt: "Help me write a strong professional summary for my CV. I am a [YOUR PROFESSION] with [X] years of experience in [YOUR FIELD]. My key skills include [SKILLS]. Make it compelling and under 4 sentences.",
    category: "writing"
  },
  { 
    id: "essay-writer", 
    icon: <PenTool size={20} />,
    title: "Essay Writer", 
    description: "Write a natural Nigerian essay",
    prompt: "Write an essay on the topic: [YOUR TOPIC]. Use clear Nigerian Standard English with simple vocabulary. Make it sound natural and human, like an educated Nigerian wrote it. Avoid AI-sounding words like 'delve' or 'tapestry'.",
    category: "writing"
  },
  { 
    id: "improve-text", 
    icon: <Sparkles size={20} />,
    title: "Improve My Text", 
    description: "Make your writing better",
    prompt: "Improve this text. Make it clearer, more engaging, and fix any grammar issues while keeping my voice:\n\n[PASTE YOUR TEXT HERE]",
    category: "writing"
  },
  { 
    id: "summarize", 
    icon: <PenTool size={20} />,
    title: "Summarize Text", 
    description: "Get key points quickly",
    prompt: "Summarize this text in bullet points. Give me the 5 most important points:\n\n[PASTE YOUR TEXT HERE]",
    category: "writing"
  },

  // Social Media
  { 
    id: "instagram-caption", 
    icon: <Heart size={20} />,
    title: "Instagram Caption", 
    description: "Catchy captions for your posts",
    prompt: "Write 3 engaging Instagram captions for a photo of [DESCRIBE YOUR PHOTO]. Include relevant hashtags. Make them trendy and relatable for Nigerian audience.",
    category: "social"
  },
  { 
    id: "tiktok-script", 
    icon: <Music size={20} />,
    title: "TikTok Script", 
    description: "Viral video script ideas",
    prompt: "Write a short TikTok video script (30-60 seconds) about [YOUR TOPIC]. Make it engaging, with a hook at the start and a call-to-action at the end.",
    category: "social"
  },
  { 
    id: "linkedin-post", 
    icon: <TrendingUp size={20} />,
    title: "LinkedIn Post", 
    description: "Professional social content",
    prompt: "Write a professional LinkedIn post about [YOUR TOPIC]. Make it insightful, include a personal angle, and end with a question to encourage engagement.",
    category: "social"
  },
  { 
    id: "whatsapp-message", 
    icon: <MessageSquare size={20} />,
    title: "WhatsApp Message", 
    description: "Draft the perfect message",
    prompt: "Help me write a WhatsApp message to [RECIPIENT] about [TOPIC]. The tone should be [formal/casual/friendly]. Keep it natural and Nigerian.",
    category: "social"
  },

  // Learning
  { 
    id: "explain-concept", 
    icon: <GraduationCap size={20} />,
    title: "Explain Like I'm 12", 
    description: "Simple explanations",
    prompt: "Explain [CONCEPT] in simple terms like I'm 12 years old. Use everyday examples and avoid jargon.",
    category: "learning"
  },
  { 
    id: "waec-prep", 
    icon: <GraduationCap size={20} />,
    title: "WAEC/NECO Prep", 
    description: "Exam preparation help",
    prompt: "Help me prepare for my WAEC [SUBJECT] exam. Explain [TOPIC] clearly and give me practice questions with answers.",
    category: "learning"
  },
  { 
    id: "jamb-practice", 
    icon: <GraduationCap size={20} />,
    title: "JAMB Practice", 
    description: "UTME preparation",
    prompt: "Give me 10 JAMB-style multiple choice questions on [SUBJECT]: [TOPIC]. Include explanations for the correct answers.",
    category: "learning"
  },
  { 
    id: "math-solver", 
    icon: <Code size={20} />,
    title: "Math Problem Solver", 
    description: "Step-by-step solutions",
    prompt: "Solve this math problem step by step. Explain each step clearly so I can understand:\n\n[YOUR MATH PROBLEM]",
    category: "learning"
  },

  // Coding
  { 
    id: "write-code", 
    icon: <Code size={20} />,
    title: "Write Code", 
    description: "Generate code for your task",
    prompt: "Write code in [LANGUAGE] to [DESCRIBE WHAT YOU WANT]. Include comments explaining the logic.",
    category: "coding"
  },
  { 
    id: "debug-code", 
    icon: <Code size={20} />,
    title: "Debug My Code", 
    description: "Find and fix errors",
    prompt: "Debug this code. Explain what's wrong and provide the fixed version:\n\n```\n[PASTE YOUR CODE HERE]\n```",
    category: "coding"
  },
  { 
    id: "explain-code", 
    icon: <Code size={20} />,
    title: "Explain Code", 
    description: "Understand code better",
    prompt: "Explain this code line by line in simple terms:\n\n```\n[PASTE CODE HERE]\n```",
    category: "coding"
  },

  // Business
  { 
    id: "business-plan", 
    icon: <TrendingUp size={20} />,
    title: "Business Plan Outline", 
    description: "Structure your business idea",
    prompt: "Create a business plan outline for [BUSINESS IDEA]. Include: Executive Summary, Market Analysis, Products/Services, Marketing Strategy, Financial Projections, and Team Structure.",
    category: "business"
  },
  { 
    id: "marketing-copy", 
    icon: <Sparkles size={20} />,
    title: "Marketing Copy", 
    description: "Persuasive ad content",
    prompt: "Write marketing copy for [PRODUCT/SERVICE]. Target audience: [AUDIENCE]. Highlight benefits, create urgency, and include a strong call-to-action.",
    category: "business"
  },

  // Creative
  { 
    id: "story-writer", 
    icon: <Heart size={20} />,
    title: "Story Writer", 
    description: "Creative fiction",
    prompt: "Write a short story about [TOPIC/THEME]. Make it engaging with vivid descriptions and interesting characters.",
    category: "creative"
  },
  { 
    id: "song-lyrics", 
    icon: <Music size={20} />,
    title: "Song Lyrics", 
    description: "Music lyrics generator",
    prompt: "Write lyrics for a [GENRE: Afrobeats/Hip-hop/Gospel/R&B] song about [TOPIC]. Include verse, chorus, and bridge.",
    category: "creative"
  },

  // Everyday
  { 
    id: "recipe", 
    icon: <Heart size={20} />,
    title: "Nigerian Recipe", 
    description: "Cooking instructions",
    prompt: "Give me the recipe for [NIGERIAN DISH]. Include ingredients with quantities, step-by-step instructions, and cooking tips.",
    category: "everyday"
  },
  { 
    id: "translate", 
    icon: <MessageSquare size={20} />,
    title: "Translate", 
    description: "Language translation",
    prompt: "Translate this text from [SOURCE LANGUAGE] to [TARGET LANGUAGE]:\n\n[YOUR TEXT]",
    category: "everyday"
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "social", label: "Social Media", icon: MessageSquare },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "coding", label: "Coding", icon: Code },
  { id: "business", label: "Business", icon: TrendingUp },
  { id: "creative", label: "Creative", icon: Music },
  { id: "everyday", label: "Everyday", icon: Heart },
];

export default function Prompts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [editedText, setEditedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const filteredPrompts = PROMPT_TEMPLATES.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenPrompt = (prompt: PromptTemplate) => {
    setEditingPrompt(prompt);
    setEditedText(prompt.prompt);
  };

  // Fixed: Use useCallback and prevent multiple sends
  const handleSendPrompt = useCallback(() => {
    if (!editedText.trim() || isSending) return;
    
    setIsSending(true);
    setEditingPrompt(null);
    
    // Use sessionStorage to pass the prompt safely
    sessionStorage.setItem('hanchi_prefill_prompt', editedText.trim());
    
    // Navigate without state to prevent re-triggers
    navigate("/chat");
    
    // Reset after navigation
    setTimeout(() => setIsSending(false), 500);
  }, [editedText, isSending, navigate]);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(editedText);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-4 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="rounded-xl h-11 w-11"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Prompt Library</h1>
            <p className="text-sm text-muted-foreground">
              Ready-to-use prompts — Click to edit & send
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-muted/50 border-transparent text-base focus:border-primary/30"
          />
        </div>

        {/* Categories */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt, index) => (
            <button
              key={prompt.id}
              onClick={() => handleOpenPrompt(prompt)}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all text-left group animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                {prompt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2 text-base">
                  {prompt.title}
                  <Edit3 size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No prompts found matching your search.</p>
          </div>
        )}
      </div>

      {/* Edit & Send Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {editingPrompt?.icon}
              </div>
              {editingPrompt?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Edit the prompt below to customize it, then send to Hanchi
            </p>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[200px] resize-none text-base rounded-xl"
              placeholder="Enter your prompt..."
            />
            <p className="text-xs text-muted-foreground">
              Tip: Replace the [BRACKETED] parts with your specific details
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2 pt-4">
            <Button variant="outline" onClick={handleCopyPrompt} className="gap-2 rounded-xl">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              Copy
            </Button>
            <Button 
              onClick={handleSendPrompt} 
              className="gap-2 flex-1 rounded-xl"
              disabled={isSending}
            >
              <Send size={16} />
              Send to Hanchi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
