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
import { EnhancedQuickActions } from "@/components/EnhancedQuickActions";
import { SmartReplySuggestions } from "@/components/SmartReplySuggestions";
import { AIModelSelector } from "@/components/AIModelSelector";
import { ToneSelector } from "@/components/ToneSelector";
import { ThinkBeforeTalkToggle } from "@/components/ThinkBeforeTalkToggle";
import { Menu, Bell, Globe, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { analytics } from "@/utils/analytics";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [selectedModel, setSelectedModel] = useState('mistral');
  const [selectedTone, setSelectedTone] = useState('default');
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thinkModeEnabled, setThinkModeEnabled] = useState(() => {
    const saved = localStorage.getItem('hanchi_think_mode');
    return saved !== null ? JSON.parse(saved) : false;
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
  
  // Pass model, tone, and thinkMode to useChat
  const { messages, isLoading, isStreaming, sendMessage, regenerateLastMessage, editMessage, stopGeneration } = 
    useChat(language, currentConversationId, user?.id || null, {
      model: selectedModel,
      tone: selectedTone,
      thinkMode: thinkModeEnabled,
    });
  
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
    setCurrentConversationId(null);
  };

  const handleSend = async (content: string, images?: string[]) => {
    // Auto-create conversation on first message
    if (!currentConversationId) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      const convId = await createConversation(title, language);
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
      title: enabled ? "Think Mode ON 🧠" : "Think Mode OFF",
      description: enabled ? "AI will reason step-by-step before answering" : "Quick responses enabled",
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

  const getLastThought = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].thought) {
        return messages[i].thought;
      }
    }
    return '';
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4 animate-bounce">👃🏿</div>
          <p className="text-muted-foreground">Loading Hanchi...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const lastAIMessage = getLastAIMessage();
  const lastThought = getLastThought();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <OfflineIndicator />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
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
        <header className="h-14 flex items-center justify-between px-4 md:px-6 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-lg h-9 w-9"
            >
              <Menu size={18} />
            </Button>
            
            {/* Model Selector */}
            <AIModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            
            {/* Tone Selector */}
            <ToneSelector
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Think Mode Toggle */}
            <ThinkBeforeTalkToggle
              enabled={thinkModeEnabled}
              onToggle={handleToggleThinking}
              thought={lastThought}
              isThinking={isLoading && thinkModeEnabled}
            />
            
            <div className="hidden md:flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-full text-xs">
              <Globe size={12} className="text-primary" />
              <span className="text-muted-foreground">
                {language === 'en' ? 'EN' : language === 'ha' ? 'HA' : 'PID'}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
              <Bell size={16} />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-40 scrollbar-thin">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto pt-8"
              >
                <NoseSphere />
                
                {/* Enhanced Quick Actions */}
                <EnhancedQuickActions onActionClick={handleSend} />
              </motion.div>
            ) : (
              <motion.div 
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto pt-4"
              >
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MessageBubbleV2
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
                      onEdit={
                        msg.role === 'user'
                          ? (newContent) => editMessage(index, newContent)
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
                
                {/* Streaming/Loading Indicator */}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs">
                      👃🏿
                    </div>
                    <ThinkingIndicatorV2 />
                    {isStreaming && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopGeneration}
                        className="ml-auto flex items-center gap-2 rounded-full"
                      >
                        <Square size={12} className="fill-current" />
                        Stop
                      </Button>
                    )}
                  </motion.div>
                )}
                
                {/* Smart Reply Suggestions */}
                {!isLoading && lastAIMessage && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                  <SmartReplySuggestions
                    lastMessage={lastAIMessage}
                    messageType={detectMessageType(lastAIMessage)}
                    onSuggestionClick={handleSend}
                  />
                )}
                
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Input */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-6 z-20">
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
