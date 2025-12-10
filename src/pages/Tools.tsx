import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Wand2, Globe, Calculator, MessageSquare, FileText, 
  Mic, Code, BookOpen, Mail, Brain, Image as ImageIcon, 
  Languages, Sparkles, Search, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  prompt: string;
  comingSoon?: boolean;
}

const tools: Tool[] = [
  {
    id: "image-gen",
    name: "Image Generator",
    description: "Create stunning images from text descriptions",
    icon: <Wand2 size={24} />,
    color: "bg-purple-500",
    prompt: "Generate an image of: "
  },
  {
    id: "translator",
    name: "Language Translator",
    description: "Translate between English, Hausa, Pidgin & more",
    icon: <Languages size={24} />,
    color: "bg-blue-500",
    prompt: "Translate the following text to [language]: "
  },
  {
    id: "summarizer",
    name: "Text Summarizer",
    description: "Get quick summaries of long articles",
    icon: <FileText size={24} />,
    color: "bg-green-500",
    prompt: "Summarize the following text in bullet points: "
  },
  {
    id: "math-solver",
    name: "Math Solver",
    description: "Solve math problems step-by-step",
    icon: <Calculator size={24} />,
    color: "bg-orange-500",
    prompt: "Solve this math problem step-by-step and explain each step: "
  },
  {
    id: "code-helper",
    name: "Code Helper",
    description: "Write, debug, and explain code",
    icon: <Code size={24} />,
    color: "bg-cyan-500",
    prompt: "Help me with this coding task: "
  },
  {
    id: "email-writer",
    name: "Email Writer",
    description: "Draft professional emails quickly",
    icon: <Mail size={24} />,
    color: "bg-red-500",
    prompt: "Write a professional email about: "
  },
  {
    id: "whatsapp-drafter",
    name: "WhatsApp Drafter",
    description: "Craft the perfect message",
    icon: <MessageSquare size={24} />,
    color: "bg-green-600",
    prompt: "Help me write a WhatsApp message to: "
  },
  {
    id: "study-helper",
    name: "Study Helper",
    description: "WAEC, NECO, JAMB preparation",
    icon: <BookOpen size={24} />,
    color: "bg-yellow-500",
    prompt: "Help me study for my exam on: "
  },
  {
    id: "voice-translate",
    name: "Voice Translation",
    description: "Speak and translate in real-time",
    icon: <Mic size={24} />,
    color: "bg-pink-500",
    prompt: ""
  },
  {
    id: "web-search",
    name: "Web Search",
    description: "Search the internet for current info",
    icon: <Globe size={24} />,
    color: "bg-indigo-500",
    prompt: "Search the web for: "
  },
  {
    id: "brainstorm",
    name: "Brainstorm Ideas",
    description: "Generate creative ideas for any project",
    icon: <Lightbulb size={24} />,
    color: "bg-amber-500",
    prompt: "Brainstorm 10 creative ideas for: "
  },
  {
    id: "essay-writer",
    name: "Essay Writer",
    description: "Write essays in Nigerian English style",
    icon: <FileText size={24} />,
    color: "bg-teal-500",
    prompt: "Write an essay about: "
  },
  {
    id: "explain",
    name: "Concept Explainer",
    description: "Understand any topic simply",
    icon: <Brain size={24} />,
    color: "bg-violet-500",
    prompt: "Explain this concept in simple terms: "
  },
  {
    id: "sticker-gen",
    name: "Sticker Generator",
    description: "Create Nigerian-style WhatsApp stickers",
    icon: <Sparkles size={24} />,
    color: "bg-lime-500",
    prompt: ""
  },
];

export default function Tools() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolClick = (tool: Tool) => {
    if (tool.id === "voice-translate" || tool.id === "sticker-gen") {
      // These open modals in the chat page
      navigate("/chat", { state: { openTool: tool.id } });
    } else {
      navigate("/chat", { state: { initialPrompt: tool.prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <img src={hanchiLogo} alt="Hanchi" className="w-8 h-8 rounded-full" />
            <h1 className="text-xl font-bold text-foreground">AI Tools</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🛠️
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">AI-Powered Tools</h2>
          <p className="text-muted-foreground">Everything you need in one place - completely free!</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 rounded-full bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool, index) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleToolClick(tool)}
              className="bg-card border border-border rounded-2xl p-6 text-left hover:shadow-lg hover:scale-[1.02] transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                {tool.name}
                {tool.comingSoon && (
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">Soon</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </motion.button>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-6">All Tools are 100% Free!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary">14+</div>
              <div className="text-sm text-muted-foreground">AI Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Free Usage</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
