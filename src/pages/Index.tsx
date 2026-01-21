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
import { Menu, Bell, Globe, ImagePlus, Sparkles, PenLine, Square, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { analytics } from "@/utils/analytics";
import { useToast } from "@/hooks/use-toast";


export default function Index() {
  const [language, setLanguage] = useState("en");
  const [selectedModel, setSelectedModel] = useState('gemini-flash');
  const [selectedTone, setSelectedTone] = useState('default');
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [thinkModeEnabled, setThinkModeEnabled] = useState(() => {
    const saved = localStorage.getItem('hanchi_think_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  
  const chatOptions = {
    model: selectedModel,
    tone: selectedTone,
    thinkMode: thinkModeEnabled,
    searchWeb: webSearchEnabled,
  };
  
  const { messages, isLoading, isStreaming, sendMessage, regenerateLastMessage, editMessage, stopGeneration } = 
    useChat(language, currentConversationId, user?.id || null, chatOptions);
  const { getMemoryContext } = useUserMemory(user?.id || null);

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
    localStorage.setItem('hanchi_think_mode', JSON.stringify(thinkModeEnabled));
  }, [thinkModeEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    setCurrentConversationId(null);
  };

  const handleSend = async (content: string, images?: string[]) => {
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
    handleSend(prompt);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleToggleThinking = (enabled: boolean) => {
    setThinkModeEnabled(enabled);
    toast({
      title: enabled ? "Think Mode ON 💭" : "Think Mode OFF",
      description: enabled ? "Hanchi will analyze deeper before responding" : "Quick responses enabled",
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
            
            <AIModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Web Search Toggle */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50">
              <Search size={14} className={webSearchEnabled ? "text-primary" : "text-muted-foreground"} />
              <span className="text-xs text-muted-foreground">Web</span>
              <Switch
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
                className="scale-75"
              />
            </div>
            
            {/* Think Mode Toggle */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50">
              <span className="text-xs">💭</span>
              <span className="text-xs text-muted-foreground">Think</span>
              <Switch
                checked={thinkModeEnabled}
                onCheckedChange={handleToggleThinking}
                className="scale-75"
              />
            </div>
            
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
                What can I help with?
              </h2>
              <p className="text-muted-foreground text-center text-sm max-w-md mb-8">
                Ask me anything - I'll nose out the answer for you.
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
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Surprise me</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSend("Help me write a professional email to apply for a job")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-card hover:bg-muted border-border/50 rounded-xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PenLine className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Help me write</span>
                </Button>
                
                <EnhancedQuickActions onAction={handleQuickAction} disabled={isLoading} />
              </div>
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
          <FloatingInput
            onSend={handleSend}
            disabled={isLoading}
            language={language}
            activeFeatures={{
              thinking: thinkModeEnabled,
              webSearch: webSearchEnabled,
            }}
            onToggleThinking={handleToggleThinking}
          />
        </div>
      </div>
    </div>
  );
}
