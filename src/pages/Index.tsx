import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  const { messages, isLoading, sendMessage } = useChat(language, currentConversationId, user?.id || null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    const title = `New chat - ${new Date().toLocaleDateString()}`;
    const convId = await createConversation(title, language);
    if (convId) {
      setCurrentConversationId(convId);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        isLoading={loadingHistory}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Hanchi AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector language={language} onLanguageChange={setLanguage} />
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Welcome to Hanchi AI</h2>
                <p className="text-muted-foreground">Start a conversation to begin</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  language={language}
                  images={message.images}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border p-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={async (content, images) => {
                if (!currentConversationId) {
                  const convId = await createConversation(
                    content.slice(0, 50) + (content.length > 50 ? "..." : ""),
                    language
                  );
                  if (convId) {
                    setCurrentConversationId(convId);
                  }
                }
                await sendMessage(content, images);
              }}
              disabled={isLoading}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
