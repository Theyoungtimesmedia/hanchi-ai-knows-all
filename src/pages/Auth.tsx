import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back! 👃",
          description: "Successfully nosed in",
        });
        navigate("/chat");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created! 👃",
          description: "Successfully signed up. Start nosing out answers!",
        });
        navigate("/chat");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: "Free AI for everyone" },
    { icon: Zap, text: "Lightning fast responses" },
    { icon: Shield, text: "Nigerian context built-in" },
    { icon: Globe, text: "English, Hausa & Pidgin" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl">👃🏿</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Hanchi AI</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your Nigerian AI Assistant
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Nose out answers to any question. Write essays, code, emails, 
            and more — with Nigerian cultural understanding built in.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                <feature.icon size={20} className="text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2024 Hanchi AI. All rights reserved.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <span className="text-3xl">👃🏿</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Hanchi AI</span>
            </div>
          </div>
          
          <div className="bg-card rounded-3xl shadow-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              {isLogin ? "Continue nosing out answers 👃" : "Start your AI journey with Hanchi"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 px-4 bg-muted rounded-xl border border-transparent focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                    placeholder="Ibrahim Musa"
                  />
                </div>
              )}
              
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-muted rounded-xl border border-transparent focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                  placeholder="name@example.com"
                  required
                />
              </div>
              
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-muted rounded-xl border border-transparent focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          {/* Mobile features */}
          <div className="mt-8 lg:hidden grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                <feature.icon size={16} className="text-primary shrink-0" />
                <span className="text-xs font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
