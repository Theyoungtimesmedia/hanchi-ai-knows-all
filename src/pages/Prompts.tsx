import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Search, Mail, FileText, Code, Calculator, 
  Languages, Briefcase, Lightbulb, BookOpen, Music,
  MessageSquare, Sparkles, PenTool, GraduationCap,
  TrendingUp, Heart, Utensils, Plane
} from "lucide-react";

interface PromptTemplate {
  id: string;
  emoji: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Writing
  { 
    id: "email-formal", 
    emoji: "✉️", 
    title: "Professional Email", 
    description: "Write a formal business email",
    prompt: "Write a professional email for the following situation. Make it clear, concise, and appropriately formal:\n\n[Describe your situation here]",
    category: "writing"
  },
  { 
    id: "email-job", 
    emoji: "💼", 
    title: "Job Application", 
    description: "Apply for a job position",
    prompt: "Write a compelling job application email for the position of [JOB TITLE] at [COMPANY]. Highlight my experience in [YOUR SKILLS] and my passion for [INDUSTRY/FIELD].",
    category: "writing"
  },
  { 
    id: "cv-writer", 
    emoji: "📄", 
    title: "CV/Resume Helper", 
    description: "Improve your CV content",
    prompt: "Help me write a strong professional summary for my CV. I am a [YOUR PROFESSION] with [X] years of experience in [YOUR FIELD]. My key skills include [SKILLS]. Make it compelling and under 4 sentences.",
    category: "writing"
  },
  { 
    id: "essay-writer", 
    emoji: "📝", 
    title: "Essay Writer", 
    description: "Write a natural Nigerian essay",
    prompt: "Write an essay on the topic: [YOUR TOPIC]. Use clear Nigerian Standard English with simple vocabulary. Make it sound natural and human, like an educated Nigerian wrote it. Avoid AI-sounding words like 'delve' or 'tapestry'.",
    category: "writing"
  },
  { 
    id: "improve-text", 
    emoji: "✨", 
    title: "Improve My Text", 
    description: "Make your writing better",
    prompt: "Improve this text. Make it clearer, more engaging, and fix any grammar issues while keeping my voice:\n\n[PASTE YOUR TEXT HERE]",
    category: "writing"
  },
  { 
    id: "summarize", 
    emoji: "📋", 
    title: "Summarize Text", 
    description: "Get key points quickly",
    prompt: "Summarize this text in bullet points. Give me the 5 most important points:\n\n[PASTE YOUR TEXT HERE]",
    category: "writing"
  },

  // Social Media
  { 
    id: "instagram-caption", 
    emoji: "📸", 
    title: "Instagram Caption", 
    description: "Catchy captions for your posts",
    prompt: "Write 3 engaging Instagram captions for a photo of [DESCRIBE YOUR PHOTO]. Include relevant hashtags. Make them trendy and relatable for Nigerian audience.",
    category: "social"
  },
  { 
    id: "tiktok-script", 
    emoji: "🎬", 
    title: "TikTok Script", 
    description: "Viral video script ideas",
    prompt: "Write a short TikTok video script (30-60 seconds) about [YOUR TOPIC]. Make it engaging, with a hook at the start and a call-to-action at the end.",
    category: "social"
  },
  { 
    id: "linkedin-post", 
    emoji: "💼", 
    title: "LinkedIn Post", 
    description: "Professional social content",
    prompt: "Write a professional LinkedIn post about [YOUR TOPIC]. Make it insightful, include a personal angle, and end with a question to encourage engagement.",
    category: "social"
  },
  { 
    id: "whatsapp-message", 
    emoji: "💬", 
    title: "WhatsApp Message", 
    description: "Draft the perfect message",
    prompt: "Help me write a WhatsApp message to [RECIPIENT] about [TOPIC]. The tone should be [formal/casual/friendly]. Keep it natural and Nigerian.",
    category: "social"
  },
  { 
    id: "twitter-thread", 
    emoji: "🐦", 
    title: "Twitter/X Thread", 
    description: "Engaging thread format",
    prompt: "Write a Twitter/X thread (5-7 tweets) explaining [YOUR TOPIC]. Start with a hook, provide value in the middle, and end with a strong conclusion.",
    category: "social"
  },

  // Learning
  { 
    id: "explain-concept", 
    emoji: "💡", 
    title: "Explain Like I'm 12", 
    description: "Simple explanations",
    prompt: "Explain [CONCEPT] in simple terms like I'm 12 years old. Use everyday examples and avoid jargon.",
    category: "learning"
  },
  { 
    id: "waec-prep", 
    emoji: "📚", 
    title: "WAEC/NECO Prep", 
    description: "Exam preparation help",
    prompt: "Help me prepare for my WAEC [SUBJECT] exam. Explain [TOPIC] clearly and give me practice questions with answers.",
    category: "learning"
  },
  { 
    id: "jamb-practice", 
    emoji: "🎯", 
    title: "JAMB Practice", 
    description: "UTME preparation",
    prompt: "Give me 10 JAMB-style multiple choice questions on [SUBJECT]: [TOPIC]. Include explanations for the correct answers.",
    category: "learning"
  },
  { 
    id: "math-solver", 
    emoji: "🔢", 
    title: "Math Problem Solver", 
    description: "Step-by-step solutions",
    prompt: "Solve this math problem step by step. Explain each step clearly so I can understand:\n\n[YOUR MATH PROBLEM]",
    category: "learning"
  },
  { 
    id: "study-notes", 
    emoji: "📖", 
    title: "Study Notes Creator", 
    description: "Organized study materials",
    prompt: "Create comprehensive study notes on [TOPIC]. Include key concepts, definitions, examples, and memory tips. Format with clear headings.",
    category: "learning"
  },
  { 
    id: "quiz-me", 
    emoji: "❓", 
    title: "Quiz Me", 
    description: "Test your knowledge",
    prompt: "Quiz me on [SUBJECT/TOPIC]. Ask me 5 questions one at a time, wait for my answer, then tell me if I'm correct and explain why.",
    category: "learning"
  },

  // Coding
  { 
    id: "write-code", 
    emoji: "💻", 
    title: "Write Code", 
    description: "Generate code for your task",
    prompt: "Write code in [LANGUAGE] to [DESCRIBE WHAT YOU WANT]. Include comments explaining the logic.",
    category: "coding"
  },
  { 
    id: "debug-code", 
    emoji: "🐛", 
    title: "Debug My Code", 
    description: "Find and fix errors",
    prompt: "Debug this code. Explain what's wrong and provide the fixed version:\n\n```\n[PASTE YOUR CODE HERE]\n```",
    category: "coding"
  },
  { 
    id: "explain-code", 
    emoji: "📖", 
    title: "Explain Code", 
    description: "Understand code better",
    prompt: "Explain this code line by line in simple terms:\n\n```\n[PASTE CODE HERE]\n```",
    category: "coding"
  },
  { 
    id: "code-review", 
    emoji: "🔍", 
    title: "Code Review", 
    description: "Improve your code quality",
    prompt: "Review this code and suggest improvements for performance, readability, and best practices:\n\n```\n[PASTE CODE HERE]\n```",
    category: "coding"
  },

  // Business
  { 
    id: "business-plan", 
    emoji: "📊", 
    title: "Business Plan Outline", 
    description: "Structure your business idea",
    prompt: "Create a business plan outline for [BUSINESS IDEA]. Include: Executive Summary, Market Analysis, Products/Services, Marketing Strategy, Financial Projections, and Team Structure.",
    category: "business"
  },
  { 
    id: "proposal", 
    emoji: "📝", 
    title: "Business Proposal", 
    description: "Professional proposals",
    prompt: "Write a business proposal for [SERVICE/PRODUCT] to [CLIENT/COMPANY]. Include problem statement, proposed solution, timeline, and pricing structure.",
    category: "business"
  },
  { 
    id: "marketing-copy", 
    emoji: "📢", 
    title: "Marketing Copy", 
    description: "Persuasive ad content",
    prompt: "Write marketing copy for [PRODUCT/SERVICE]. Target audience: [AUDIENCE]. Highlight benefits, create urgency, and include a strong call-to-action.",
    category: "business"
  },
  { 
    id: "side-hustle", 
    emoji: "💰", 
    title: "Side Hustle Ideas", 
    description: "Nigerian income ideas",
    prompt: "Suggest 10 practical side hustle ideas for someone in Nigeria with [YOUR SKILLS/INTERESTS]. Include startup costs and potential earnings.",
    category: "business"
  },

  // Creative
  { 
    id: "story-writer", 
    emoji: "📚", 
    title: "Story Writer", 
    description: "Creative fiction",
    prompt: "Write a short story about [TOPIC/THEME]. Make it engaging with vivid descriptions and interesting characters.",
    category: "creative"
  },
  { 
    id: "poem", 
    emoji: "🎭", 
    title: "Poetry", 
    description: "Beautiful verses",
    prompt: "Write a [TYPE: love/motivational/nature] poem about [SUBJECT]. Make it emotionally resonant and use vivid imagery.",
    category: "creative"
  },
  { 
    id: "song-lyrics", 
    emoji: "🎵", 
    title: "Song Lyrics", 
    description: "Music lyrics generator",
    prompt: "Write lyrics for a [GENRE: Afrobeats/Hip-hop/Gospel/R&B] song about [TOPIC]. Include verse, chorus, and bridge.",
    category: "creative"
  },
  { 
    id: "birthday-message", 
    emoji: "🎂", 
    title: "Birthday Message", 
    description: "Heartfelt wishes",
    prompt: "Write a heartfelt birthday message for my [RELATIONSHIP: friend/parent/partner/colleague] who is turning [AGE]. Make it personal and warm.",
    category: "creative"
  },

  // Everyday
  { 
    id: "recipe", 
    emoji: "🍳", 
    title: "Nigerian Recipe", 
    description: "Cooking instructions",
    prompt: "Give me the recipe for [NIGERIAN DISH]. Include ingredients with quantities, step-by-step instructions, and cooking tips.",
    category: "everyday"
  },
  { 
    id: "travel-plan", 
    emoji: "✈️", 
    title: "Travel Planner", 
    description: "Trip itinerary",
    prompt: "Plan a [X-DAY] trip to [DESTINATION]. Include: daily itinerary, estimated costs in Naira, must-see attractions, and packing tips.",
    category: "everyday"
  },
  { 
    id: "translate", 
    emoji: "🌍", 
    title: "Translate", 
    description: "Language translation",
    prompt: "Translate this text from [SOURCE LANGUAGE] to [TARGET LANGUAGE]:\n\n[YOUR TEXT]",
    category: "everyday"
  },
  { 
    id: "decision-help", 
    emoji: "🤔", 
    title: "Decision Helper", 
    description: "Pros and cons analysis",
    prompt: "Help me decide between [OPTION 1] and [OPTION 2]. List the pros and cons of each and give me your recommendation based on my priority of [YOUR PRIORITY].",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPrompts = PROMPT_TEMPLATES.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUsePrompt = (prompt: PromptTemplate) => {
    // Navigate to chat with the prompt pre-filled
    navigate("/chat", { state: { prefillPrompt: prompt.prompt } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Prompt Library</h1>
            <p className="text-sm text-muted-foreground">
              Ready-to-use prompts for any task
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-muted/50"
          />
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
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
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleUsePrompt(prompt)}
              className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {prompt.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">
                  {prompt.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prompts found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
