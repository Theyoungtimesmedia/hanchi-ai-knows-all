import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Globe, Mic, Image as ImageIcon, Search, Sparkles, Zap, CheckCircle2, Code, MessageSquare, Shield, PenLine, BookOpen, Star, Users, Lightbulb, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NosyMascot } from "@/components/NosyMascot";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: <Brain className="w-5 h-5" />, title: "Deep Reasoning", description: "Complex problem solving with step-by-step thinking", color: "from-blue-500 to-indigo-600" },
    { icon: <Globe className="w-5 h-5" />, title: "Multilingual", description: "English, Hausa, Pidgin — native fluency", color: "from-emerald-500 to-teal-600" },
    { icon: <Mic className="w-5 h-5" />, title: "Voice Chat", description: "Talk naturally, get spoken responses", color: "from-orange-500 to-red-500" },
    { icon: <ImageIcon className="w-5 h-5" />, title: "Image Creation", description: "Generate stunning visuals from text", color: "from-pink-500 to-rose-500" },
    { icon: <Search className="w-5 h-5" />, title: "Web Search", description: "Real-time information with sources", color: "from-cyan-500 to-blue-500" },
    { icon: <Code className="w-5 h-5" />, title: "Code Assistant", description: "Write, debug, and explain code", color: "from-violet-500 to-purple-600" },
  ];

  const useCases = [
    { emoji: "📱", title: "Social Media", description: "Captions, hashtags, content ideas" },
    { emoji: "💼", title: "Work", description: "Emails, reports, presentations" },
    { emoji: "📚", title: "Learning", description: "Study guides, explanations, quizzes" },
    { emoji: "🎨", title: "Creative", description: "Stories, art prompts, brainstorming" },
    { emoji: "🏥", title: "Health", description: "Symptom info, wellness tips" },
    { emoji: "✈️", title: "Travel", description: "Planning, budgets, itineraries" },
  ];

  const pricingTiers = [
    { name: "Free", price: "$0", period: "/forever", features: ["Unlimited chats", "Web search", "2 images/day", "Voice input", "Basic models"], badge: "Most Popular", highlight: true },
    { name: "Go", price: "$8", period: "/month", features: ["10x more messages", "More images", "Priority responses", "File analysis", "No ads"], badge: null, highlight: false },
    { name: "Plus", price: "$20", period: "/month", features: ["Deep Research", "Canvas mode", "All models", "Agent mode", "25 file uploads"], badge: "Best Value", highlight: false },
    { name: "Pro", price: "$200", period: "/month", features: ["Maximum everything", "Pro models", "Priority support", "40 file uploads", "Early features"], badge: null, highlight: false },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated multi-color gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-purple-500/[0.03] to-emerald-500/[0.03]" />
        <motion.div 
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.12), transparent 70%)" }}
          animate={{ x: [0, 120, 0], y: [0, 60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(160 84% 39% / 0.12), transparent 70%)" }}
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/2 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(280 60% 55% / 0.08), transparent 70%)" }}
          animate={{ x: [-250, 250, -250], y: [-80, 80, -80] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md">
                <span className="text-base">👃🏿</span>
              </div>
              <span className="text-sm font-bold text-foreground">Hanchi AI</span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">Features</button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">Pricing</button>
              <button onClick={() => navigate("/help")} className="hover:text-foreground transition-colors">Help</button>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-xs rounded-lg h-8">
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")} className="text-xs rounded-lg h-8 bg-primary hover:bg-primary/90">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12">
        {/* Hero */}
        <motion.section 
          className="max-w-3xl mx-auto text-center px-4 sm:px-6 pb-16"
          initial="initial" animate="animate" variants={stagger}
        >
          <motion.div className="relative inline-flex items-center justify-center w-24 h-24 mb-5" variants={fadeUp}>
            <NosyMascot variant="landing" />
          </motion.div>

          <motion.div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary mb-4" variants={fadeUp}>
            <Sparkles size={10} /> Powered by GPT-5 & Gemini
          </motion.div>

          <motion.h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight tracking-tight" variants={fadeUp}>
            The AI That{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
              Knows
            </span>{" "}
            Everything
          </motion.h1>

          <motion.p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto" variants={fadeUp}>
            Chat, create images, search the web, write code — with deep Nigerian cultural understanding. Free forever.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-10" variants={fadeUp}>
            <Button size="lg" onClick={() => navigate("/auth")} className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-lg shadow-primary/20 text-sm font-semibold">
              Start Chatting Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-10 px-6 rounded-xl text-sm">
              See what it can do
            </Button>
          </motion.div>

          {/* Demo chat preview */}
          <motion.div className="relative max-w-xl mx-auto" variants={fadeUp}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 blur-2xl -z-10" />
            <div className="rounded-2xl bg-card/80 backdrop-blur border border-border/40 p-4 shadow-xl">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-destructive/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="ml-auto text-[9px] text-muted-foreground">Hanchi Chat</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-end">
                  <div className="max-w-[180px] px-3 py-2 rounded-2xl rounded-br-sm bg-primary/10 border border-primary/20">
                    <p className="text-[11px]">Create an image of Lagos at sunset</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">👃🏿</span>
                  </div>
                  <div className="max-w-[220px] px-3 py-2 rounded-2xl rounded-bl-sm bg-muted/50 border border-border/40">
                    <p className="text-[11px] text-foreground">
                      Here's Lagos at sunset with the Third Mainland Bridge glowing 🌅✨
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <motion.div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-semibold shadow-lg"
              animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              Free ✨
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Benefits strip */}
        <div className="max-w-2xl mx-auto px-4 mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["Free forever", "Nigerian context", "Works offline", "Privacy-first"].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg bg-card/50 border border-border/30">
                <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold mb-2">
              <Zap size={9} /> CAPABILITIES
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">Everything You Need</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">Powerful AI for students, professionals, and creators</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {features.map((f, i) => (
              <motion.div key={i} className="group cursor-pointer rounded-xl bg-card/50 backdrop-blur border border-border/30 p-3.5 hover:border-primary/20 transition-all hover:shadow-md"
                onClick={() => navigate("/auth")} whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${f.color} flex items-center justify-center mb-2.5 text-white shadow-md`}>
                  {f.icon}
                </div>
                <h3 className="text-xs font-semibold text-foreground mb-0.5">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-4xl mx-auto px-4 mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[9px] font-semibold mb-2">
              <Lightbulb size={9} /> USE CASES
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">Built for Real Life</h2>
            <p className="text-xs text-muted-foreground">From schoolwork to business, Hanchi adapts to you</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {useCases.map((uc, i) => (
              <motion.div key={i} className="p-3.5 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => navigate("/auth")} whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <span className="text-xl mb-2 block">{uc.emoji}</span>
                <h3 className="text-xs font-semibold text-foreground mb-0.5">{uc.title}</h3>
                <p className="text-[10px] text-muted-foreground">{uc.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="max-w-3xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-3 gap-2.5">
            {[{ value: "500K+", label: "Messages" }, { value: "50K+", label: "Users" }, { value: "99%", label: "Uptime" }].map((s, i) => (
              <div key={i} className="text-center p-3.5 rounded-xl bg-card/60 border border-border/30">
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <section id="pricing" className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold mb-2">
              <Star size={9} /> PRICING
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">Simple, Fair Pricing</h2>
            <p className="text-xs text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} className={`relative rounded-xl border p-4 ${tier.highlight ? 'border-primary/30 bg-primary/[0.03] shadow-md' : 'border-border/30 bg-card/50'}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                {tier.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-semibold">
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-sm font-bold text-foreground mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-[10px] text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant={tier.highlight ? "default" : "outline"} onClick={() => navigate("/auth")} className="w-full text-[10px] h-8 rounded-lg">
                  {tier.price === "$0" ? "Get Started" : "Subscribe"}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-4 mb-12">
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 border border-primary/15 p-8 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/8 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <span className="text-xl">👃🏿</span>
              </div>
              <h2 className="text-base font-bold text-foreground mb-1.5">Ready to Start?</h2>
              <p className="text-xs text-muted-foreground mb-5 max-w-sm mx-auto">Join thousands using Hanchi AI every day.</p>
              <Button size="lg" onClick={() => navigate("/auth")} className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-lg text-sm font-semibold">
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/20 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-xs">👃🏿</span>
            </div>
            <span className="text-xs font-semibold text-foreground">Hanchi AI</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <button onClick={() => navigate("/help")} className="hover:text-foreground transition-colors">Help</button>
            <button onClick={() => navigate("/discover")} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => navigate("/prompts")} className="hover:text-foreground transition-colors">Prompts</button>
          </div>
          <p className="text-[9px] text-muted-foreground">© 2026 Hanchi AI</p>
        </div>
      </footer>
    </div>
  );
}
