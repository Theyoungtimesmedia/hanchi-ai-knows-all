import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Globe, Mic, Image as ImageIcon, Search, Sparkles } from "lucide-react";
import hanchiLogo from "@/assets/hanchi-nose-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Nose Out Answers",
      description: "AI that thinks before it talks, delivering accurate and thoughtful responses"
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      title: "Multilingual",
      description: "English, Hausa, and Nigerian Pidgin - we speak your language"
    },
    {
      icon: <Mic className="w-8 h-8 text-green-500" />,
      title: "Voice Translation",
      description: "Real-time voice-to-voice translation between Nigerian languages"
    },
    {
      icon: <ImageIcon className="w-8 h-8 text-purple-500" />,
      title: "Image Generation",
      description: "Create stunning images from text descriptions"
    },
    {
      icon: <Search className="w-8 h-8 text-orange-500" />,
      title: "Web Search",
      description: "Search the web and get answers with sources"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
      title: "Nigerian Context",
      description: "Deep understanding of Nigerian culture, education, and daily life"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={hanchiLogo} alt="Hanchi" className="w-10 h-10 rounded-full" />
              <span className="text-xl font-bold text-foreground">Hanchi AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-bounce-slow">
            <span className="text-8xl">👃🏿</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            The AI That <span className="text-primary">Noses Out</span> Everything
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Hanchi is Nigeria's smartest AI assistant. Ask anything, create images, 
            translate between languages, and get answers that understand your world.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/30"
            >
              Start Nosing 👃 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="rounded-full px-8 py-6 text-lg border-border"
            >
              Learn More
            </Button>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-md max-w-xs">
                    <p className="text-sm">How do I say "Hello" in Hausa?</p>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-md max-w-sm">
                    <p className="text-sm text-foreground">
                      <span className="text-primary font-semibold">👃 Nosed it!</span> In Hausa, you say "<strong>Sannu</strong>" (pronounced sah-noo). 
                      It's a warm greeting used throughout Northern Nigeria! 🇳🇬
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Free to use!
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            What Can Hanchi Nose Out? 👃
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-orange-500/10 rounded-3xl p-8 sm:p-12 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Nosing? 👃🏿
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of Nigerians using Hanchi to learn, create, and communicate better.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg"
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👃🏿</span>
                <span className="font-semibold text-foreground">Hanchi AI</span>
              </div>
              <p className="text-sm text-muted-foreground">The AI that noses out everything. Built for Nigerians, by Nigerians.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/tools")} className="hover:text-primary">AI Tools</button></li>
                <li><button onClick={() => navigate("/prompts")} className="hover:text-primary">Prompt Library</button></li>
                <li><button onClick={() => navigate("/discover")} className="hover:text-primary">Discover</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/help")} className="hover:text-primary">Help Center</button></li>
                <li><button onClick={() => navigate("/about")} className="hover:text-primary">About Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/terms")} className="hover:text-primary">Terms of Service</button></li>
                <li><button onClick={() => navigate("/terms")} className="hover:text-primary">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Hanchi AI. The AI that noses out everything.
            </p>
            <p className="text-sm text-muted-foreground">Made with ❤️ for Nigeria</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
