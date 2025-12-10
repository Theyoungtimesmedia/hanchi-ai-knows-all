import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Sparkles, Briefcase, GraduationCap, 
  Code, Palette, Heart, MessageSquare, Globe, Mic, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

const useCases = [
  {
    id: "social",
    icon: <MessageSquare size={32} />,
    title: "Social Media",
    description: "Create viral posts, captions, and content",
    color: "bg-pink-500",
    examples: [
      "Write an Instagram caption for my Lagos sunset photo",
      "Create a Twitter thread about Nigerian tech startups",
      "Help me write a LinkedIn post about my promotion"
    ]
  },
  {
    id: "work",
    icon: <Briefcase size={32} />,
    title: "Work & Business",
    description: "Emails, proposals, and professional documents",
    color: "bg-blue-500",
    examples: [
      "Draft a professional email to my boss about working from home",
      "Create a business proposal for a catering service",
      "Write a meeting agenda for our team standup"
    ]
  },
  {
    id: "learning",
    icon: <GraduationCap size={32} />,
    title: "Learning & Education",
    description: "Study help, exam prep, and homework",
    color: "bg-green-500",
    examples: [
      "Explain photosynthesis like I'm in SS2",
      "Help me solve this quadratic equation step by step",
      "Create a study plan for my WAEC exams"
    ]
  },
  {
    id: "coding",
    icon: <Code size={32} />,
    title: "Coding & Tech",
    description: "Write, debug, and explain code",
    color: "bg-purple-500",
    examples: [
      "Write a Python function to calculate compound interest",
      "Debug this JavaScript code that's giving me an error",
      "Explain how REST APIs work with examples"
    ]
  },
  {
    id: "creative",
    icon: <Palette size={32} />,
    title: "Creative & Design",
    description: "Stories, art, and creative projects",
    color: "bg-orange-500",
    examples: [
      "Write a short story set in pre-colonial Nigeria",
      "Create an image prompt for a futuristic Lagos cityscape",
      "Help me brainstorm logo ideas for my bakery"
    ]
  },
  {
    id: "personal",
    icon: <Heart size={32} />,
    title: "Personal Life",
    description: "Relationships, advice, and daily tasks",
    color: "bg-red-500",
    examples: [
      "Help me write a birthday message for my friend",
      "Create a weekly meal plan with Nigerian foods",
      "Give me tips for my first job interview"
    ]
  }
];

const features = [
  {
    icon: <Globe size={24} />,
    title: "Web Search",
    description: "Get real-time information from the internet"
  },
  {
    icon: <ImageIcon size={24} />,
    title: "Image Generation",
    description: "Create images from text descriptions"
  },
  {
    icon: <Mic size={24} />,
    title: "Voice Translation",
    description: "Translate speech between English, Hausa & Pidgin"
  },
  {
    icon: <Sparkles size={24} />,
    title: "Nigerian Stickers",
    description: "Generate WhatsApp stickers with Nigerian vibes"
  }
];

export default function Discover() {
  const navigate = useNavigate();

  const tryExample = (example: string) => {
    navigate("/chat", { state: { initialPrompt: example } });
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
            <h1 className="text-xl font-bold text-foreground">Discover</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Discover What Hanchi Can Do
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From writing emails to solving math problems, creating images to translating languages - 
            Hanchi is your all-in-one AI assistant. Explore use cases and try examples!
          </p>
        </motion.div>

        {/* Special Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">Special Features ⚡</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate("/chat")}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Use Cases */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-foreground text-center">Use Cases 🎯</h3>
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-card border border-border rounded-3xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${useCase.color} flex items-center justify-center text-white shrink-0`}>
                    {useCase.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{useCase.title}</h4>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Try these examples:</p>
                  {useCase.examples.map((example, exIndex) => (
                    <button
                      key={exIndex}
                      onClick={() => tryExample(example)}
                      className="w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group"
                    >
                      <span>"{example}"</span>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 rounded-3xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">Ready to explore? 👃🏿</h3>
          <p className="text-muted-foreground mb-6">
            Start chatting with Hanchi and discover all the ways it can help you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/chat")} className="rounded-full px-8">
              Start Chatting <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/prompts")} className="rounded-full px-8">
              Browse Prompts
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
