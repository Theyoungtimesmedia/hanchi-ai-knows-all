import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { QuickActionChips } from "@/components/QuickActionChips";
import { TypingIndicator } from "@/components/TypingIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { analytics } from "@/utils/analytics";
import hanchiLogo from "@/assets/hanchi-logo-3.png";

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
      } else {
        analytics.setUserId(session.user.id);
        analytics.trackPageView('chat');
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
      <OfflineIndicator />
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        isLoading={loadingHistory}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-gradient-hero border-b border-border p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img src={hanchiLogo} alt="Hanchi AI" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Hanchi AI
              </h1>
              <p className="text-[10px] text-muted-foreground">Your Nigerian AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector language={language} onLanguageChange={setLanguage} />
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-hero">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
                <div className="text-center max-w-2xl space-y-6">
                  <img src={hanchiLogo} alt="Hanchi AI" className="w-24 h-24 mx-auto mb-2" />
                  <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Chat with Hanchi AI 👃🏿
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Your Nigerian AI assistant for anything
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-2">✉️</div>
                      <h3 className="font-semibold text-sm mb-1">Write</h3>
                      <p className="text-xs text-muted-foreground">Emails, essays, reports</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-2">💻</div>
                      <h3 className="font-semibold text-sm mb-1">Code</h3>
                      <p className="text-xs text-muted-foreground">Generate & debug code</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-2">🌍</div>
                      <h3 className="font-semibold text-sm mb-1">Translate</h3>
                      <p className="text-xs text-muted-foreground">Any language</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-2">🎨</div>
                      <h3 className="font-semibold text-sm mb-1">Create</h3>
                      <p className="text-xs text-muted-foreground">Images & content</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                language={language}
                images={message.images}
                confidence={message.confidence}
                sources={message.sources}
              />
            ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border p-3 bg-card shadow-warm">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <QuickActionChips
                onAction={async (prompt) => {
                  if (!currentConversationId) {
                    const convId = await createConversation(
                      prompt.slice(0, 50) + "...",
                      language
                    );
                    if (convId) {
                      setCurrentConversationId(convId);
                    }
                  }
                  await sendMessage(prompt);
                }}
                disabled={isLoading}
              />
            )}
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
