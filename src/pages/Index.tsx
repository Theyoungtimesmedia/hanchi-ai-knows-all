import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useUserMemory } from "@/hooks/useUserMemory";
import { MessageBubbleV2 } from "@/components/MessageBubbleV2";
import { FloatingInputV2 } from "@/components/FloatingInputV2";
import { ActiveAddons } from "@/components/EnhancedPlusMenu";
import { AppSidebar } from "@/components/AppSidebar";
import { NoseSphere } from "@/components/NoseSphere";
import { ThinkingIndicatorV2 } from "@/components/ThinkingIndicatorV2";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SmartReplySuggestions } from "@/components/SmartReplySuggestions";
import { AIModelSelector } from "@/components/AIModelSelector";
import { ToneSelector } from "@/components/ToneSelector";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { QuickSearchModal } from "@/components/QuickSearchModal";
import { Menu, Bell, Globe, ImagePlus, Sparkles, PenLine, Square, BookOpen, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { analytics } from "@/utils/analytics";
import { useToast } from "@/hooks/use-toast";

interface CustomGPT {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  emoji: string;
}

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [selectedModel, setSelectedModel] = useState('gemini-flash');
  const [selectedTone, setSelectedTone] = useState('default');
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [activeCustomGPT, setActiveCustomGPT] = useState<CustomGPT | null>(null);
  const [activeAddons, setActiveAddons] = useState<ActiveAddons>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  
  const chatOptions = {
    model: selectedModel,
    tone: selectedTone,
    thinkMode: activeAddons.thinking || false,
    searchWeb: activeAddons.search || false,
    deepResearch: activeAddons.deepResearch || false,
    customSystemPrompt: activeCustomGPT?.systemPrompt || "",
  };
  
  const { messages, isLoading, isStreaming, sendMessage, regenerateLastMessage, editMessage, stopGeneration } = 
    useChat(language, currentConversationId, user?.id || null, chatOptions);
  const { getMemoryContext, addMemory } = useUserMemory(user?.id || null);

  // Check for active custom GPT on load
  useEffect(() => {
    const saved = sessionStorage.getItem('hanchi_active_custom_gpt');
    if (saved) {
      try {
        setActiveCustomGPT(JSON.parse(saved));
        sessionStorage.removeItem('hanchi_active_custom_gpt');
      } catch (e) {}
    }
  }, []);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle prefilled prompts from sessionStorage (from Prompts page)
  useEffect(() => {
    if (!isInitialized || !user) return;
    
    const prefillPrompt = sessionStorage.getItem('hanchi_prefill_prompt');
    if (prefillPrompt) {
      // Clear immediately to prevent re-triggers
      sessionStorage.removeItem('hanchi_prefill_prompt');
      // Small delay to ensure state is ready
      setTimeout(() => {
        handleSend(prefillPrompt);
      }, 100);
    }
  }, [isInitialized, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            setShowQuickSearch(true);
            break;
          case 'n':
            e.preventDefault();
            handleNewConversation();
            break;
          case 'p':
            e.preventDefault();
            navigate('/prompts');
            break;
          case ',':
            e.preventDefault();
            navigate('/settings');
            break;
          case '/':
          case '?':
            e.preventDefault();
            setShowShortcuts(true);
            break;
          case 'b':
            e.preventDefault();
            setSidebarOpen(prev => !prev);
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowQuickSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleNewConversation = async () => {
    // Instant new conversation - just clear state
    setCurrentConversationId(null);
    setActiveCustomGPT(null);
  };

  const handleSend = async (content: string, images?: string[], addons?: ActiveAddons) => {
    // Merge addons if provided
    if (addons) {
      setActiveAddons(addons);
    }
    
    // Create conversation instantly if needed
    if (!currentConversationId) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      // Create conversation in background - don't wait
      createConversation(title, language).then(convId => {
        if (convId) {
          setCurrentConversationId(convId);
        }
      });
    }
    
    // Send message immediately
    await sendMessage(content, images);
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center animate-in fade-in duration-300">
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
      
      {/* Modals */}
      <KeyboardShortcutsModal open={showShortcuts} onOpenChange={setShowShortcuts} />
      <QuickSearchModal 
        open={showQuickSearch} 
        onOpenChange={setShowQuickSearch}
        conversations={conversations}
        onSelectConversation={(id) => {
          setCurrentConversationId(id);
          setShowQuickSearch(false);
        }}
        onNewConversation={handleNewConversation}
      />
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
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
            
            {activeCustomGPT ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                <span className="text-lg">{activeCustomGPT.emoji}</span>
                <span className="text-sm font-medium">{activeCustomGPT.name}</span>
                <button 
                  onClick={() => setActiveCustomGPT(null)}
                  className="text-xs text-muted-foreground hover:text-foreground ml-1"
                >
                  ×
                </button>
              </div>
            ) : (
              <AIModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ToneSelector 
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
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
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NoseSphere />
              
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 text-center">
                {activeCustomGPT ? `Chat with ${activeCustomGPT.name}` : "What can I help with?"}
              </h2>
              <p className="text-muted-foreground text-center text-sm max-w-md mb-8">
                {activeCustomGPT?.description || "Ask me anything - I'll nose out the answer for you."}
              </p>
              
              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md mx-auto">
                <Button
                  variant="outline"
                  onClick={() => handleSend("Generate an image of a beautiful Nigerian landscape")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-card hover:bg-muted border-border/50 rounded-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ImagePlus className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Create image</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSend("Tell me an interesting fact about Nigeria that would surprise most people")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-card hover:bg-muted border-border/50 rounded-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Surprise me</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSend("Help me write a professional email to apply for a job")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-card hover:bg-muted border-border/50 rounded-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PenLine className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">Help me write</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/prompts")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-card hover:bg-muted border-border/50 rounded-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Prompt Library</span>
                </Button>
              </div>

              {/* Custom GPT Link */}
              <Button
                variant="ghost"
                onClick={() => navigate("/custom-gpt")}
                className="mt-4 gap-2 text-muted-foreground"
              >
                <Bot size={16} />
                Build Custom GPT
              </Button>

              {/* Keyboard shortcut hint */}
              <p className="text-xs text-muted-foreground mt-4">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">⌘K</kbd> for quick actions
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pt-4">
              {messages.map((msg, index) => (
                <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3 mb-4">
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
                </div>
              )}
              
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
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-6 z-20">
          <FloatingInputV2
            onSend={handleSend}
            disabled={isLoading}
            language={language}
            placeholder={activeCustomGPT ? `Ask ${activeCustomGPT.name}...` : "Ask Hanchi..."}
          />
        </div>
      </div>
    </div>
  );
}
