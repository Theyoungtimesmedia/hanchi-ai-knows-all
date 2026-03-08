import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Share2, MessageSquare } from "lucide-react";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { motion } from "framer-motion";

interface SharedMessage {
  role: string;
  content: string;
  created_at: string | null;
}

export default function SharedChat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [messages, setMessages] = useState<SharedMessage[]>([]);
  const [title, setTitle] = useState("Shared Conversation");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No share token provided");
      setIsLoading(false);
      return;
    }
    loadSharedConversation(token);
  }, [token]);

  const loadSharedConversation = async (shareToken: string) => {
    try {
      // Get shared conversation record
      const { data: shared, error: sharedErr } = await supabase
        .from("shared_conversations")
        .select("*")
        .eq("share_token", shareToken)
        .eq("is_public", true)
        .single();

      if (sharedErr || !shared) {
        setError("Conversation not found or has expired");
        return;
      }

      // Check expiry
      if (shared.expires_at && new Date(shared.expires_at) < new Date()) {
        setError("This shared link has expired");
        return;
      }

      // Increment view count
      await supabase
        .from("shared_conversations")
        .update({ view_count: (shared.view_count || 0) + 1 })
        .eq("id", shared.id);

      // Get conversation title
      if (shared.conversation_id) {
        const { data: conv } = await supabase
          .from("conversations")
          .select("title")
          .eq("id", shared.conversation_id)
          .single();
        if (conv) setTitle(conv.title);

        // Get messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("role, content, created_at")
          .eq("conversation_id", shared.conversation_id)
          .order("created_at", { ascending: true });

        if (msgs) setMessages(msgs);
      }
    } catch (err) {
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <MessageSquare size={48} className="text-muted-foreground/30" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/")} className="rounded-xl gap-2">
          <ArrowLeft size={16} /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Share2 size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Shared conversation</span>
            </div>
            <h1 className="text-sm font-semibold truncate">{title}</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-sm">👃🏿</span>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 border border-border/50"
            }`}>
              {msg.role === "assistant" ? (
                <MarkdownMessage content={msg.content} />
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-border p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Powered by Hanchi AI 👃🏿</p>
        <Button onClick={() => navigate("/chat")} className="rounded-xl gap-2" size="sm">
          Start your own conversation
        </Button>
      </div>
    </div>
  );
}
