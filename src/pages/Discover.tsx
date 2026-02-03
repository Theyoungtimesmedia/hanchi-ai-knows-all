import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, MessageSquare, Image as ImageIcon, Mic,
  Globe, Brain, Sparkles, Shield, BookOpen, Code, Calculator,
  Mail, FileText, Languages, Lightbulb, Music, PenTool, Play,
  Sticker, Zap
} from "lucide-react";

interface FeatureDemo {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  examplePrompt: string;
  color: string;
}

const FEATURE_DEMOS: FeatureDemo[] = [
  {
    id: "chat",
    icon: <MessageSquare size={28} />,
    title: "Smart Conversations",
    description: "Ask anything and get thoughtful, context-aware responses in Nigerian English",
    category: "core",
    examplePrompt: "Explain the current fuel subsidy situation in Nigeria like I'm a secondary school student",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    id: "think",
    icon: <Brain size={28} />,
    title: "Think Mode",
    description: "Enable deep analysis for complex questions - Hanchi thinks before responding",
    category: "core",
    examplePrompt: "What are the economic implications of the new Naira redesign policy? Think deeply about this.",
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    id: "image",
    icon: <ImageIcon size={28} />,
    title: "Image Generation",
    description: "Create stunning images from text with multiple styles including Nigerian aesthetics",
    category: "creative",
    examplePrompt: "Create a vibrant image of a bustling Lagos market at sunset with traders in traditional attire",
    color: "bg-pink-500/10 text-pink-500"
  },
  {
    id: "sticker",
    icon: <Sticker size={28} />,
    title: "Nigerian Stickers",
    description: "Generate WhatsApp stickers with Nigerian meme energy and Pidgin expressions",
    category: "creative",
    examplePrompt: "Create a sticker of someone with 'Sapa loading...' expression",
    color: "bg-green-500/10 text-green-500"
  },
  {
    id: "voice",
    icon: <Mic size={28} />,
    title: "Voice Translation",
    description: "Real-time voice-to-voice translation between English, Hausa, and Pidgin",
    category: "language",
    examplePrompt: "Translate 'How are you doing today?' to Hausa and speak it",
    color: "bg-cyan-500/10 text-cyan-500"
  },
  {
    id: "search",
    icon: <Globe size={28} />,
    title: "Web Search",
    description: "Search the internet for real-time news, facts, and information with sources",
    category: "core",
    examplePrompt: "What are the latest news about ASUU and Nigerian universities?",
    color: "bg-orange-500/10 text-orange-500"
  },
  {
    id: "essay",
    icon: <PenTool size={28} />,
    title: "Essay Writing",
    description: "Natural Nigerian Standard English essays that sound human, not robotic",
    category: "writing",
    examplePrompt: "Write an essay on 'The Role of Youth in Nation Building' for my WAEC exam",
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    id: "email",
    icon: <Mail size={28} />,
    title: "Email Drafting",
    description: "Professional emails for job applications, business, and formal communication",
    category: "writing",
    examplePrompt: "Write a professional email applying for an internship at a tech company in Lagos",
    color: "bg-indigo-500/10 text-indigo-500"
  },
  {
    id: "code",
    icon: <Code size={28} />,
    title: "Code Helper",
    description: "Write, debug, and explain code in any programming language",
    category: "tech",
    examplePrompt: "Write a Python function to validate Nigerian phone numbers",
    color: "bg-slate-500/10 text-slate-500"
  },
  {
    id: "math",
    icon: <Calculator size={28} />,
    title: "Math Solver",
    description: "Step-by-step solutions for any math problem from basic to advanced",
    category: "learning",
    examplePrompt: "Solve this JAMB math question: If 2x + 3y = 12 and x - y = 1, find x and y",
    color: "bg-yellow-500/10 text-yellow-500"
  },
  {
    id: "study",
    icon: <BookOpen size={28} />,
    title: "WAEC/JAMB Prep",
    description: "Practice questions, explanations, and study notes for Nigerian exams",
    category: "learning",
    examplePrompt: "Give me 5 JAMB-style questions on photosynthesis with explanations",
    color: "bg-red-500/10 text-red-500"
  },
  {
    id: "translate",
    icon: <Languages size={28} />,
    title: "Translation",
    description: "Translate text between English, Hausa, Pidgin, and other languages",
    category: "language",
    examplePrompt: "Translate this to Pidgin: 'The situation in the country is getting difficult'",
    color: "bg-teal-500/10 text-teal-500"
  },
  {
    id: "unrestricted",
    icon: <Shield size={28} />,
    title: "Unrestricted Mode",
    description: "Remove content filters for advanced users who need uncensored responses",
    category: "advanced",
    examplePrompt: "Enable unrestricted mode for this conversation",
    color: "bg-rose-500/10 text-rose-500"
  },
  {
    id: "summary",
    icon: <FileText size={28} />,
    title: "Summarization",
    description: "Get key points from long texts, articles, or documents quickly",
    category: "productivity",
    examplePrompt: "Summarize the key points of Nigeria's 2024 budget in bullet points",
    color: "bg-violet-500/10 text-violet-500"
  },
  {
    id: "brainstorm",
    icon: <Lightbulb size={28} />,
    title: "Brainstorming",
    description: "Generate creative ideas for business, content, projects, and more",
    category: "creative",
    examplePrompt: "Give me 10 side hustle ideas I can start in Lagos with less than ₦50,000",
    color: "bg-amber-500/10 text-amber-500"
  },
  {
    id: "lyrics",
    icon: <Music size={28} />,
    title: "Song Lyrics",
    description: "Write lyrics for Afrobeats, hip-hop, gospel, and other music genres",
    category: "creative",
    examplePrompt: "Write Afrobeats lyrics about love and Lagos nightlife",
    color: "bg-fuchsia-500/10 text-fuchsia-500"
  },
];

const CATEGORIES = [
  { id: "all", label: "All Features" },
  { id: "core", label: "Core" },
  { id: "creative", label: "Creative" },
  { id: "writing", label: "Writing" },
  { id: "learning", label: "Learning" },
  { id: "language", label: "Language" },
  { id: "tech", label: "Tech" },
  { id: "productivity", label: "Productivity" },
  { id: "advanced", label: "Advanced" },
];

export default function Discover() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFeatures = selectedCategory === "all"
    ? FEATURE_DEMOS
    : FEATURE_DEMOS.filter(f => f.category === selectedCategory);

  const handleTryFeature = (feature: FeatureDemo) => {
    navigate("/chat", { state: { prefillPrompt: feature.examplePrompt } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="rounded-xl h-10 w-10"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-lg">👃🏿</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Discover Hanchi</h1>
              <p className="text-xs text-muted-foreground">
                Explore all features
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center py-8 mb-6">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-primary/15 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center nose-sphere">
              <span className="text-4xl">👃🏿</span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            What can Hanchi nose out for you?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From writing essays to creating images, translating languages to solving math — 
            discover all the ways Hanchi can help you.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className="group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-muted/50 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Try this:</p>
                <p className="text-sm italic line-clamp-2">"{feature.examplePrompt}"</p>
              </div>

              <Button
                onClick={() => handleTryFeature(feature)}
                variant="outline"
                className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
              >
                <Play size={14} className="mr-2" />
                Try it now
                <ArrowRight size={14} className="ml-auto" />
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border text-center">
          <Zap size={32} className="mx-auto mb-3 text-primary" />
          <h3 className="font-semibold text-lg mb-2">Ready to explore?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            All features are completely free. No limits, no premium tiers.
          </p>
          <Button onClick={() => navigate("/chat")} className="rounded-full">
            Start chatting with Hanchi
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
