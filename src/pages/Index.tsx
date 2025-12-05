import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useUserMemory } from "@/hooks/useUserMemory";
import { MessageBubbleV2 } from "@/components/MessageBubbleV2";
import { FloatingInput } from "@/components/FloatingInput";
import { AppSidebar } from "@/components/AppSidebar";
import { NoseSphere } from "@/components/NoseSphere";
import { ThinkingIndicatorV2 } from "@/components/ThinkingIndicatorV2";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ExpandedQuickActions } from "@/components/ExpandedQuickActions";
import { SmartReplySuggestions } from "@/components/SmartReplySuggestions";
import { Menu, Bell, Globe, ImagePlus, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { analytics } from "@/utils/analytics";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thinkModeEnabled, setThinkModeEnabled] = useState(() => {
    // Persist thinking mode preference
    const saved = localStorage.getItem('hanchi_think_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [jailbreakEnabled, setJailbreakEnabled] = useState(() => {
    const saved = localStorage.getItem('hanchi_jailbreak_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  const { messages, isLoading, sendMessage, regenerateLastMessage } = 
    useChat(language, currentConversationId, user?.id || null);
  const { getMemoryContext } = useUserMemory(user?.id || null);

  // Handle auth state - persist session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          analytics.setUserId(session.user.id);
          analytics.trackPageView('chat');
        } else {
          // No session, redirect to auth
          navigate("/auth");
          return;
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        navigate("/auth");
        return;
      }
      
      setIsInitialized(true);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        navigate("/auth");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Persist feature preferences
  useEffect(() => {
    localStorage.setItem('hanchi_think_mode', JSON.stringify(thinkModeEnabled));
  }, [thinkModeEnabled]);

  useEffect(() => {
    localStorage.setItem('hanchi_jailbreak_mode', JSON.stringify(jailbreakEnabled));
  }, [jailbreakEnabled]);

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

  const handleQuickAction = (prompt: string) => {
    if (prompt === "more_options") return;
    handleSend(prompt);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleToggleThinking = (enabled: boolean) => {
    setThinkModeEnabled(enabled);
    toast({
      title: enabled ? "Thinking Mode ON 💭" : "Thinking Mode OFF",
      description: enabled ? "Hanchi will think deeper before responding" : "Quick responses enabled",
    });
  };

  const handleToggleJailbreak = (enabled: boolean) => {
    setJailbreakEnabled(enabled);
    toast({
      title: enabled ? "Unrestricted Mode ON ⚠️" : "Unrestricted Mode OFF",
      description: enabled ? "Content restrictions removed" : "Standard safety filters active",
      variant: enabled ? "destructive" : "default",
    });
  };

  const detectMessageType = (content: string): 'code' | 'text' | 'list' | 'table' | 'explanation' => {
    if (content.includes('```')) return 'code';
    if (content.includes('|') && content.includes('---')) return 'table';
    if ((content.match(/^\s*[-*•]\s/gm) || []).length >= 3) return 'list';
    if (content.length > 500) return 'explanation';
    return 'text';
  };

  const getLastAIMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i].content;
      }
    }
    return '';
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">👃🏿</div>
          <p className="text-muted-foreground">Loading Hanchi...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const lastAIMessage = getLastAIMessage();

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
        <header className="h-16 flex items-center justify-between px-4 md:px-8 z-20 bg-background border-b border-border/30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-xl"
            >
              <Menu size={20} />
            </Button>
            <div className="font-bold text-xl text-foreground flex items-center gap-2">
              <span className="text-2xl">👃🏿</span>
              <span className="hidden sm:inline">Hanchi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
              <Globe size={14} className="text-primary" />
              <span className="text-muted-foreground">
                {language === 'en' ? 'EN' : language === 'ha' ? 'HA' : 'PID'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Bell size={18} />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-36 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in pt-8">
              <NoseSphere />
              
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
                What should I nose out?
              </h2>
              <p className="text-muted-foreground text-center text-sm max-w-md mb-8">
                Ask me anything. I nose out answers with precision.
              </p>
              
              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
                <Button
                  variant="outline"
                  onClick={() => handleSend("Generate an image of...")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1.5 bg-card hover:bg-muted border-border rounded-xl"
                >
                  <ImagePlus className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Create image</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend("Tell me something interesting about Nigeria")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1.5 bg-card hover:bg-muted border-border rounded-xl"
                >
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Surprise me</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend("Help me write...")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1.5 bg-card hover:bg-muted border-border rounded-xl"
                >
                  <PenLine className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Help me write</span>
                </Button>
                <ExpandedQuickActions onAction={handleQuickAction} disabled={isLoading} />
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
              
              {/* Smart Reply Suggestions */}
              {!isLoading && lastAIMessage && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                <SmartReplySuggestions
                  lastMessage={lastAIMessage}
                  messageType={detectMessageType(lastAIMessage)}
                  onSuggestionClick={handleSend}
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8 z-20">
          <FloatingInput
            onSend={handleSend}
            disabled={isLoading}
            language={language}
            activeFeatures={{
              thinking: thinkModeEnabled,
              jailbreak: jailbreakEnabled,
            }}
            onToggleThinking={handleToggleThinking}
            onToggleJailbreak={handleToggleJailbreak}
          />
        </div>
      </div>
    </div>
  );
}
