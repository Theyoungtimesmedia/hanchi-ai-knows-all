import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Bell, LogOut, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface UserStats {
  chatCount: number;
  messageCount: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({ chatCount: 0, messageCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadUserStats(session.user.id);
    });
  }, [navigate]);

  const loadUserStats = async (userId: string) => {
    try {
      // Count conversations
      const { count: chatCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Count messages (via conversations)
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userId);

      let messageCount = 0;
      if (conversations && conversations.length > 0) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", conversations.map(c => c.id));
        messageCount = count || 0;
      }

      setStats({
        chatCount: chatCount || 0,
        messageCount,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userAvatar = user?.user_metadata?.avatar_url;
  const userPlan = "Hanchi Free";

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      {/* Header with Gradient */}
      <div className="relative h-48 bg-gradient-primary">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full"
        >
          <ArrowLeft size={24} />
        </Button>
      </div>
      
      {/* Profile Content */}
      <div className="px-6 relative -mt-16 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-card shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-card shadow-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-4xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <h1 className="mt-4 text-2xl font-bold text-foreground">{userName}</h1>
          <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full text-sm mt-1">
            {userPlan}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-card p-6 rounded-3xl shadow-sm text-center border border-border">
            <span className="text-3xl font-bold text-foreground block">{stats.chatCount}</span>
            <span className="text-muted-foreground text-sm">Chats nosed</span>
          </div>
          <div className="bg-card p-6 rounded-3xl shadow-sm text-center border border-border">
            <span className="text-3xl font-bold text-foreground block">{stats.messageCount}</span>
            <span className="text-muted-foreground text-sm">Messages sent</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-6 bg-card rounded-3xl shadow-sm overflow-hidden border border-border">
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors border-b border-border">
            <div className="flex items-center gap-3 text-foreground font-medium">
              <Shield size={20} className="text-primary" /> Security
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => navigate("/settings")}
            className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3 text-foreground font-medium">
              <Bell size={20} className="text-primary" /> Notifications
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full p-4 flex items-center justify-between hover:bg-destructive/10 text-destructive transition-colors"
          >
            <div className="flex items-center gap-3 font-medium">
              <LogOut size={20} /> Log Out
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
