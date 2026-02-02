import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Globe, Mic, Image as ImageIcon, Search, Sparkles, Shield, Zap, ChevronRight } from "lucide-react";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Intelligent Responses",
      description: "AI that thinks deeper for accurate, thoughtful answers",
      color: "text-primary"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multilingual",
      description: "English, Hausa, and Nigerian Pidgin support",
      color: "text-sky-500"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Translation",
      description: "Real-time voice-to-voice between languages",
      color: "text-emerald-500"
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: "Image Generation",
      description: "Create stunning images from descriptions",
      color: "text-violet-500"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Web Search",
      description: "Search the web and get cited sources",
      color: "text-amber-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Nigerian Context",
      description: "Deep understanding of Nigerian culture",
      color: "text-pink-500"
    }
  ];

  const stats = [
    { value: "500K+", label: "Messages sent" },
    { value: "50K+", label: "Active users" },
    { value: "99%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-primary-foreground font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-foreground">Hanchi AI</span>
            </div>
            <div className="flex items-center gap-3">
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 shadow-lg shadow-primary/25"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={14} />
            Nigeria's Smartest AI Assistant
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight animate-fade-in">
            The AI That <span className="text-gradient">Knows</span> Nigeria
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-1">
            Ask anything, create images, translate between languages — with deep Nigerian cultural understanding built in.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in stagger-2">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="btn-premium h-14 px-8 text-lg rounded-2xl"
            >
              Start Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/discover")}
              className="h-14 px-8 text-lg rounded-2xl border-border hover:bg-muted"
            >
              See Features
            </Button>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-3xl mx-auto animate-fade-in stagger-3">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 blur-3xl -z-10" />
            <div className="bg-card rounded-3xl border border-border shadow-premium p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-md max-w-xs shadow-md">
                    <p className="text-sm">How do I say "Hello" in Hausa?</p>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-muted/50 border border-border/50 px-5 py-4 rounded-2xl rounded-tl-md max-w-sm">
                    <p className="text-sm text-foreground">
                      In Hausa, you say "<strong>Sannu</strong>" (sah-noo). 
                      It's a warm greeting used throughout Northern Nigeria!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg animate-float">
              Free to use
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border/50">
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-28">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Powerful features designed for Nigerian students, professionals, and creators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card-premium p-6 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-28">
          <div className="relative bg-gradient-to-br from-primary/10 via-violet-500/5 to-primary/10 rounded-3xl p-10 sm:p-14 border border-border overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of Nigerians using Hanchi to learn, create, and communicate better.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="btn-premium h-14 px-10 text-lg rounded-2xl"
              >
                Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">H</span>
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
  );
}
