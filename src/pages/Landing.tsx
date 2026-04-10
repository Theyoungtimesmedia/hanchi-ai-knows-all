import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Brain, Globe, Mic, Image as ImageIcon, Search, Code, CheckCircle2, Star } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: "Deep Reasoning", desc: "Step-by-step thinking for complex problems" },
    { icon: Globe, title: "Multilingual", desc: "English, Hausa, Pidgin — native fluency" },
    { icon: Mic, title: "Voice Chat", desc: "Talk naturally, get spoken responses" },
    { icon: ImageIcon, title: "Image Creation", desc: "Generate stunning visuals from text" },
    { icon: Search, title: "Web Search", desc: "Real-time info with cited sources" },
    { icon: Code, title: "Code Assistant", desc: "Write, debug, and explain code" },
  ];

  const pricingTiers = [
    { name: "Free", price: "$0", period: "/forever", features: ["Unlimited chats", "Web search", "2 images/day", "Voice input"], highlight: true, badge: "Popular" },
    { name: "Go", price: "$8", period: "/mo", features: ["10x more messages", "Priority responses", "File analysis", "No ads"], highlight: false },
    { name: "Plus", price: "$20", period: "/mo", features: ["Deep Research", "Canvas mode", "All models", "Agent mode"], highlight: false, badge: "Best Value" },
    { name: "Pro", price: "$200", period: "/mo", features: ["Maximum everything", "Pro models", "Priority support", "Early features"], highlight: false },
  ];

  const f = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient bg */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">Hanchi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-xs h-8 rounded-lg">
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")} className="text-xs h-8 rounded-lg">
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        {/* Hero */}
        <motion.section className="max-w-2xl mx-auto text-center px-5 pb-20" {...f}>
          <motion.div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/12 text-[11px] font-medium text-primary mb-5"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Zap size={10} /> Powered by GPT-5 & Gemini
          </motion.div>

          <motion.h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
            Your AI assistant that{" "}
            <span className="text-gradient">understands</span>
          </motion.h1>

          <motion.p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            Chat, create, search, and code — with deep cultural context. Free to use, always.
          </motion.p>

          <motion.div className="flex items-center justify-center gap-2.5"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Button onClick={() => navigate("/auth")} className="h-9 px-5 rounded-lg text-sm font-medium gap-2">
              Start chatting <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-9 px-5 rounded-lg text-sm border-border/60">
              Learn more
            </Button>
          </motion.div>

          {/* Chat preview */}
          <motion.div className="mt-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            <div className="rounded-xl bg-card border border-border/50 p-4 shadow-lg">
              <div className="flex items-center gap-1.5 mb-3 pb-2.5 border-b border-border/30">
                <div className="w-2 h-2 rounded-full bg-destructive/40" />
                <div className="w-2 h-2 rounded-full bg-accent-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <span className="ml-auto text-[10px] text-muted-foreground font-medium">Hanchi AI</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-end">
                  <div className="max-w-[200px] px-3 py-2 rounded-xl rounded-br-sm bg-primary/8 border border-primary/12">
                    <p className="text-xs text-foreground">Explain quantum computing simply</p>
                  </div>
                </div>
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="max-w-[240px] px-3 py-2 rounded-xl rounded-bl-sm bg-muted/50 border border-border/30">
                    <p className="text-xs text-foreground leading-relaxed">
                      Think of regular computers as reading one page at a time. Quantum computers can read all pages simultaneously…
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Trust strip */}
        <div className="max-w-lg mx-auto px-5 mb-20">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {["Free forever", "Nigerian context", "Works offline", "Privacy-first"].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="max-w-3xl mx-auto px-5 mb-24">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-1.5 tracking-tight">Everything you need</h2>
            <p className="text-sm text-muted-foreground">Powerful AI for students, professionals, and creators</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feat, i) => (
              <motion.button key={i} onClick={() => navigate("/auth")}
                className="text-left p-4 rounded-xl border border-border/40 bg-card/50 hover:border-border hover:bg-card transition-all duration-200 group"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.2 }}>
                <feat.icon className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-foreground mb-0.5">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="max-w-lg mx-auto px-5 mb-24">
          <div className="flex items-center justify-around py-6 rounded-xl border border-border/40 bg-card/30">
            {[{ v: "500K+", l: "Messages" }, { v: "50K+", l: "Users" }, { v: "99%", l: "Uptime" }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-semibold text-gradient">{s.v}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <section id="pricing" className="max-w-3xl mx-auto px-5 mb-24">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-1.5 tracking-tight">Simple pricing</h2>
            <p className="text-sm text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {pricingTiers.map((tier, i) => (
              <motion.div key={i}
                className={`relative rounded-xl border p-4 ${tier.highlight ? 'border-primary/25 bg-primary/[0.02]' : 'border-border/40 bg-card/30'}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 + 0.2 }}>
                {tier.badge && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] font-medium">
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-sm font-semibold text-foreground mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-xl font-semibold text-foreground">{tier.price}</span>
                  <span className="text-[10px] text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant={tier.highlight ? "default" : "outline"} onClick={() => navigate("/auth")} className="w-full text-[10px] h-7 rounded-lg">
                  {tier.price === "$0" ? "Get started" : "Subscribe"}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-lg mx-auto px-5 mb-12">
          <div className="rounded-xl bg-primary/[0.03] border border-primary/12 p-8 text-center">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1.5">Ready to start?</h2>
            <p className="text-xs text-muted-foreground mb-5">Join thousands using Hanchi AI every day.</p>
            <Button onClick={() => navigate("/auth")} className="h-9 px-5 rounded-lg text-sm font-medium gap-2">
              Get started free <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/30 py-5 px-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">Hanchi AI</span>
          </div>
          <p className="text-[10px] text-muted-foreground">© 2026 Hanchi AI</p>
        </div>
      </footer>
    </div>
  );
}
