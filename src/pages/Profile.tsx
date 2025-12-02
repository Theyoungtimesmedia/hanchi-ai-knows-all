import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Bell, LogOut, ChevronRight, Brain, Trash2, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserMemory } from "@/hooks/useUserMemory";
import { User } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  
  const { memories, deleteMemory, loading: memoriesLoading } = useUserMemory(user?.id || null);

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
      const { count: chatCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

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

  const handleDeleteMemory = async (memoryId: string) => {
    await deleteMemory(memoryId);
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
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-3xl font-bold text-foreground block">{stats.chatCount}</span>
            <span className="text-muted-foreground text-sm">Chats nosed</span>
          </div>
          <div className="bg-card p-6 rounded-3xl shadow-sm text-center border border-border">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-3xl font-bold text-foreground block">{stats.messageCount}</span>
            <span className="text-muted-foreground text-sm">Messages sent</span>
          </div>
        </div>

        {/* Hanchi's Memory Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Hanchi's Memory</h2>
          </div>
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
            {memoriesLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading memories...
              </div>
            ) : memories.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Hanchi hasn't learned anything about you yet.</p>
                <p className="text-sm">As you chat, Hanchi will remember important details.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {memories.map((memory) => (
                  <div key={memory.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{memory.memory_key}</p>
                      <p className="text-sm text-muted-foreground truncate">{memory.memory_value}</p>
                      {memory.category && (
                        <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {memory.category}
                        </span>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hanchi will forget "{memory.memory_key}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMemory(memory.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
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
              <Bell size={20} className="text-primary" /> Settings
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
