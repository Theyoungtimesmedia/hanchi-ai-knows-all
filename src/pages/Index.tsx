import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { MessageBubbleV2 } from "@/components/MessageBubbleV2";
import { FloatingInput } from "@/components/FloatingInput";
import { AppSidebar } from "@/components/AppSidebar";
import { BreathingSphere } from "@/components/BreathingSphere";
import { ThinkingIndicatorV2 } from "@/components/ThinkingIndicatorV2";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Menu, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { analytics } from "@/utils/analytics";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Code, Sparkles } from "lucide-react";

const QUICK_SUGGESTIONS = [
  { icon: <ImageIcon size={16} />, text: "Analyze dashboard screenshot" },
  { icon: <Code size={16} />, text: "Write React button component" },
  { icon: <Globe size={16} />, text: "Translate proverb to Hausa" },
];

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  const { messages, isLoading, sendMessage, regenerateLastMessage } = 
    useChat(language, currentConversationId, user?.id || null);

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

  const handleSend = async (content: string, images?: string[]) => {
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
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <OfflineIndicator />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AppSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={(id) => {
          setCurrentConversationId(id);
          setSidebarOpen(false);
        }}
        onNewConversation={() => {
          handleNewConversation();
          setSidebarOpen(false);
        }}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => navigate("/settings")}
        onSignOut={handleSignOut}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full max-w-full">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 z-20 bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-xl bg-card shadow-sm"
            >
              <Menu size={20} />
            </Button>
            <div className="md:hidden font-bold text-xl text-foreground">Hanchi</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border">
              <Globe size={16} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'English (NG)' : language === 'ha' ? 'Hausa' : 'Pidgin'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-card shadow-sm"
            >
              <Bell size={20} />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-40 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in">
              <BreathingSphere />
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-center">
                Design your thoughts.
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Hanchi noses out answers with 100% precision. Multilingual, multimodal, and mindful.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {QUICK_SUGGESTIONS.map((suggestion, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(suggestion.text)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-full text-sm font-medium text-muted-foreground shadow-sm border border-border hover:border-primary/50 hover:text-primary transition-all hover:-translate-y-0.5"
                  >
                    {suggestion.icon}
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pt-4">
              {messages.map((msg, index) => (
                <MessageBubbleV2
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  thought={msg.thought}
                  images={msg.images}
                  confidence={msg.confidence}
                  sources={msg.sources}
                  language={language}
                  onRegenerate={
                    msg.role === 'assistant' && index === messages.length - 1
                      ? regenerateLastMessage
                      : undefined
                  }
                />
              ))}
              {isLoading && <ThinkingIndicatorV2 />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input */}
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-10 flex justify-center z-20">
          <FloatingInput
            onSend={handleSend}
            disabled={isLoading}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
