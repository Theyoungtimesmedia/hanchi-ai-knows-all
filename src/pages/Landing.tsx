import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Globe, Mic, Image as ImageIcon, Search, Sparkles, Zap, CheckCircle2, MessageSquare, Code, FileText, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Deep Thinking",
      description: "Reasons through complex problems",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multilingual",
      description: "English, Hausa, Pidgin fluency",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Voice Translation",
      description: "Real-time voice-to-voice",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      title: "Image Creation",
      description: "Generate beautiful images",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Web Search",
      description: "Search with cited sources",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Code Assistant",
      description: "Write and debug code",
      gradient: "from-violet-500 to-purple-500",
    }
  ];

  const benefits = [
    "Free to use with powerful AI",
    "Nigerian cultural context",
    "Works offline",
    "Privacy-focused"
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5" />
        <motion.div 
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-orange-500/5 to-pink-500/5 blur-3xl"
          animate={{ 
            x: [-200, 200, -200],
            y: [-100, 100, -100],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-lg">👃🏿</span>
              </div>
              <span className="text-base font-bold text-foreground">Hanchi AI</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/auth")}
                className="rounded-lg text-sm"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate("/auth")}
                className="rounded-lg bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 text-sm"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20 pb-16 px-4 sm:px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Nose Sphere */}
          <motion.div 
            className="relative inline-flex items-center justify-center w-24 h-24 mb-6"
            variants={fadeInUp}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-full blur-2xl animate-pulse" />
            <motion.div 
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500 shadow-2xl shadow-primary/30 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                  "0 0 40px rgba(59, 130, 246, 0.3)",
                  "0 0 20px rgba(168, 85, 247, 0.3)",
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="text-4xl">👃🏿</span>
            </motion.div>
          </motion.div>
          
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-primary/20 text-xs font-semibold text-primary mb-5"
            variants={fadeInUp}
          >
            <Sparkles size={12} />
            Nigeria's Smartest AI
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
            variants={fadeInUp}
          >
            The AI That{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
              Noses
            </span>{" "}
            Everything
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Ask anything, create images, translate languages — with deep Nigerian cultural understanding.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
            variants={fadeInUp}
          >
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary via-emerald-500 to-teal-500 hover:opacity-90 shadow-lg shadow-primary/25 text-sm font-semibold"
            >
              <span className="mr-2">👃🏿</span> Start Nosing <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/discover")}
              className="h-11 px-6 rounded-xl border-border/50 text-sm"
            >
              See Features
            </Button>
          </motion.div>

          {/* Demo Preview */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-2xl -z-10" />
            <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-auto text-[10px] text-muted-foreground">Hanchi Chat</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[200px] px-3 py-2 rounded-2xl rounded-br-md bg-primary/10 border border-primary/20">
                    <p className="text-xs">How do I say "Hello" in Hausa?</p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👃🏿</span>
                  </div>
                  <div className="max-w-[250px] px-3 py-2 rounded-2xl rounded-bl-md bg-muted/50 border border-border/50">
                    <p className="text-xs text-foreground">
                      In Hausa, you say "<strong className="text-primary">Sannu</strong>" (sah-noo). 
                      It's a warm greeting! 🇳🇬
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div 
              className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-[10px] font-semibold shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Free ✨
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Benefits */}
        <motion.div 
          className="max-w-2xl mx-auto mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-1.5 p-2.5 rounded-xl bg-card/50 border border-border/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-[11px] text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="max-w-5xl mx-auto mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold mb-3">
              <Zap size={10} />
              FEATURES
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Everything You Need
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Powerful features for Nigerian students, professionals, and creators
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="group cursor-pointer rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4 hover:border-primary/30 transition-all hover:shadow-lg"
                onClick={() => navigate("/auth")}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="max-w-3xl mx-auto mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "500K+", label: "Messages" },
              { value: "50K+", label: "Users" },
              { value: "99%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-br from-card/80 to-card/40 border border-border/30">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-0.5">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="max-w-3xl mx-auto mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-emerald-500/5 border border-primary/20 p-8 sm:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 mb-4 shadow-lg">
                <span className="text-2xl">👃🏿</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                Ready to Start Nosing?
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Join thousands of Nigerians using Hanchi to learn, create, and communicate.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-primary via-emerald-500 to-teal-500 hover:opacity-90 shadow-lg text-sm font-semibold"
              >
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm">👃🏿</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Hanchi AI</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("/help")} className="hover:text-foreground transition-colors">Help</button>
            <button onClick={() => navigate("/discover")} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => navigate("/prompts")} className="hover:text-foreground transition-colors">Prompts</button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            © 2024 Hanchi AI
          </p>
        </div>
      </footer>
    </div>
  );
}
