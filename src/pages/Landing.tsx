import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Globe, Mic, Image as ImageIcon, Search, Sparkles, MessageSquare, Zap, Shield, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageTransition } from "@/components/PageTransition";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Deep Thinking",
      description: "AI that reasons through complex problems step by step",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multilingual",
      description: "Fluent in English, Hausa, and Nigerian Pidgin",
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Voice Translation",
      description: "Real-time voice-to-voice across languages",
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      title: "Image Creation",
      description: "Generate beautiful images from descriptions",
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Web Search",
      description: "Search the web and get cited sources",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Nigerian Context",
      description: "Deep understanding of Nigerian culture",
    }
  ];

  const benefits = [
    "Free to use with powerful AI models",
    "No sign-up required to try",
    "Works offline after first load",
    "Privacy-focused design"
  ];

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-xl">👃🏿</span>
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">Hanchi AI</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">The AI That Knows</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate("/help")}
                className="hidden sm:inline-flex rounded-xl"
              >
                Help
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="rounded-xl"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                className="btn-premium"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Nose Sphere */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8 animate-fade-in">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-sphere flex items-center justify-center nose-sphere">
              <span className="text-5xl">👃🏿</span>
            </div>
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 animate-fade-in">
            <Sparkles size={14} />
            Nigeria's Smartest AI Assistant
          </div>
          
          <h1 className="text-display text-foreground mb-6 animate-fade-in stagger-1">
            The AI That <span className="text-gradient">Noses</span> Everything
          </h1>
          
          <p className="text-body-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in stagger-2">
            Ask anything, create images, translate between languages — Hanchi noses out the answers with deep Nigerian cultural understanding.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in stagger-3">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="btn-premium h-14 px-8 text-lg"
            >
              <span className="mr-2">👃🏿</span> Start Nosing <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/discover")}
              className="h-14 px-8 text-lg rounded-xl border-border hover:bg-muted"
            >
              See Features
            </Button>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-3xl mx-auto animate-fade-in stagger-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-3xl -z-10" />
            <div className="card-premium p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="ml-auto text-xs text-muted-foreground">Hanchi Chat</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="message-user max-w-xs">
                    <p className="text-sm">How do I say "Hello" in Hausa?</p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">👃🏿</span>
                  </div>
                  <div className="message-assistant max-w-sm">
                    <p className="text-sm text-foreground">
                      In Hausa, you say "<strong className="text-primary">Sannu</strong>" (sah-noo). 
                      It's a warm greeting used throughout Northern Nigeria! 🇳🇬
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg animate-float">
              Free to use ✨
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Zap size={12} />
              POWERFUL FEATURES
            </div>
            <h2 className="text-title text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-body text-muted-foreground max-w-xl mx-auto">
              Powerful features designed for Nigerian students, professionals, and creators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card-premium p-6 group cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "500K+", label: "Messages sent" },
              { value: "50K+", label: "Active users" },
              { value: "99%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="relative card-premium p-10 sm:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <span className="text-3xl">👃🏿</span>
              </div>
              <h2 className="text-title text-foreground mb-4">
                Ready to Start Nosing?
              </h2>
              <p className="text-body text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of Nigerians using Hanchi to learn, create, and communicate better.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="btn-premium h-14 px-10 text-lg"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-base">👃🏿</span>
              </div>
              <span className="font-semibold text-foreground">Hanchi AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/help")} className="hover:text-foreground transition-colors">Help</button>
              <button onClick={() => navigate("/discover")} className="hover:text-foreground transition-colors">Features</button>
              <button onClick={() => navigate("/prompts")} className="hover:text-foreground transition-colors">Prompts</button>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Hanchi AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </PageTransition>
  );
}
