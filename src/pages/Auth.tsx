import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

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
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Successfully signed up. You can now start chatting.",
        });
        navigate("/");
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden p-8 md:p-12 border border-border animate-scale-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-primary shadow-lg flex items-center justify-center">
            <span className="text-4xl">👃🏿</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-foreground mb-2">
          {isLogin ? "Welcome Back" : "Join Hanchi"}
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          {isLogin ? "Continue nosing out answers 👃" : "Start your AI journey with Hanchi"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {!isLogin && (
            <div className="bg-muted rounded-2xl px-4 py-3 border border-transparent focus-within:border-primary focus-within:bg-card transition-all">
              <label className="text-xs text-muted-foreground block ml-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent outline-none text-foreground font-medium"
                placeholder="Ibrahim Musa"
              />
            </div>
          )}
          
          {/* Email */}
          <div className="bg-muted rounded-2xl px-4 py-3 border border-transparent focus-within:border-primary focus-within:bg-card transition-all">
            <label className="text-xs text-muted-foreground block ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground font-medium"
              placeholder="name@example.com"
              required
            />
          </div>
          
          {/* Password */}
          <div className="bg-muted rounded-2xl px-4 py-3 border border-transparent focus-within:border-primary focus-within:bg-card transition-all">
            <label className="text-xs text-muted-foreground block ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-foreground font-medium"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 transition-transform active:scale-95 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Nosing in...
              </>
            ) : (
              <>
                <span>👃</span>
                {isLogin ? "Nose In" : "Start Nosing"}
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
    </div>
  );
}
