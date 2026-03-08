import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useUserMemory } from "@/hooks/useUserMemory";
import { useImageGeneration, detectImageCommand } from "@/hooks/useImageGeneration";
import { MessageBubbleV2 } from "@/components/MessageBubbleV2";
import { FloatingInputV2 } from "@/components/FloatingInputV2";
import { ActiveAddons } from "@/components/EnhancedPlusMenu";
import { AppSidebar } from "@/components/AppSidebar";
import { NoseSphere } from "@/components/NoseSphere";
import { ThinkingIndicatorV2 } from "@/components/ThinkingIndicatorV2";
import { NosyMascotV2 } from "@/components/nosy";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SmartReplySuggestions } from "@/components/SmartReplySuggestions";
import { AIModelSelector } from "@/components/AIModelSelector";
import { ToneSelector } from "@/components/ToneSelector";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { QuickSearchModal } from "@/components/QuickSearchModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VoiceModePanel } from "@/components/VoiceModePanel";
import { CanvasMode } from "@/components/CanvasMode";
import { ImageGenerationModal } from "@/components/ImageGenerationModal";
import { VoiceTranslationPanel } from "@/components/VoiceTranslationPanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Menu, Bell, Globe, ImagePlus, Sparkles, PenLine, Square, BookOpen, Bot, Loader2, Mic, Columns, X } from "lucide-react";
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
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [activeCustomGPT, setActiveCustomGPT] = useState<CustomGPT | null>(null);
  const [activeAddons, setActiveAddons] = useState<ActiveAddons>({});
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [canvasState, setCanvasState] = useState<{ open: boolean; content: string; type: "code" | "document" } | null>(null);
  const [currentInputText, setCurrentInputText] = useState("");
  const [showImageGen, setShowImageGen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string }[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hanchi_dismissed_announcements');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { isGenerating: isGeneratingImage, generateImage } = useImageGeneration();
  const [pendingImagePrompt, setPendingImagePrompt] = useState<string | null>(null);

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
  
  const { messages, isLoading, isStreaming, sendMessage, addMessage, regenerateLastMessage, editMessage, stopGeneration } = 
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

  useEffect(() => {
    if (!isInitialized || !user) return;
    const prefillPrompt = sessionStorage.getItem('hanchi_prefill_prompt');
    if (prefillPrompt) {
      sessionStorage.removeItem('hanchi_prefill_prompt');
      setTimeout(() => handleSend(prefillPrompt), 100);
    }
  }, [isInitialized, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k': e.preventDefault(); setShowQuickSearch(true); break;
          case 'n': e.preventDefault(); handleNewConversation(); break;
          case 'p': e.preventDefault(); navigate('/prompts'); break;
          case ',': e.preventDefault(); navigate('/settings'); break;
          case '/': case '?': e.preventDefault(); setShowShortcuts(true); break;
          case 'b': e.preventDefault(); setSidebarOpen(prev => !prev); break;
        }
      }
      if (e.key === 'Escape') { setShowShortcuts(false); setShowQuickSearch(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleNewConversation = async () => {
    setIsCreatingConversation(true);
    setCurrentConversationId(null);
    setActiveCustomGPT(null);
    setTimeout(() => setIsCreatingConversation(false), 100);
  };

  const handleSend = async (content: string, images?: string[], addons?: ActiveAddons) => {
    if (addons) setActiveAddons(addons);
    
    // Ensure conversation exists
    if (!currentConversationId) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      createConversation(title, language).then(convId => {
        if (convId) setCurrentConversationId(convId);
      });
    }
    
    const imageCommand = detectImageCommand(content);
    if (imageCommand.type) {
      const isSticker = imageCommand.type === 'sticker';
      // Add user message manually (don't send to AI)
      addMessage({ role: "user", content });
      
      // Generate image
      setPendingImagePrompt(imageCommand.prompt);
      const result = await generateImage(imageCommand.prompt, isSticker ? 'sticker' : 'default', isSticker);
      setPendingImagePrompt(null);
      
      if (result?.url) {
        // Add the generated image as an assistant message
        addMessage({ role: "assistant", content: `Here's what I created for "${imageCommand.prompt}" 🎨`, images: [result.url] });
      } else {
        addMessage({ role: "assistant", content: "Sorry, I couldn't generate that image. Try again? 😅" });
      }
      return;
    }
    
    await sendMessage(content, images);
  };

  // Canvas: detect if last AI message has code blocks for canvas trigger
  const handleOpenCanvas = useCallback(() => {
    const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAI) return;
    const hasCode = lastAI.content.includes('```');
    setCanvasState({
      open: true,
      content: hasCode ? lastAI.content.replace(/```\w*\n?/g, '').replace(/```/g, '') : lastAI.content,
      type: hasCode ? "code" : "document",
    });
  }, [messages]);

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
      if (messages[i].role === 'assistant') return messages[i].content;
    }
    return '';
  };

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
            <span className="text-3xl">👃🏿</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading Hanchi...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const lastAIMessage = getLastAIMessage();
  const showEmptyState = messages.length === 0 && !isCreatingConversation;

  return (
    <motion.div className="flex h-screen bg-background overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <OfflineIndicator />
      <NosyMascotV2
        isLoading={isLoading || isGeneratingImage}
        isStreaming={isStreaming}
        messageCount={messages.length}
        hasError={false}
        lastMessageContent={messages.length > 0 ? messages[messages.length - 1].content : undefined}
        isFirstMessage={messages.length === 1}
        variant="chat"
        inputText={currentInputText}
        onInputCorrection={setCurrentInputText}
      />
      
      {/* Modals */}
      <KeyboardShortcutsModal open={showShortcuts} onOpenChange={setShowShortcuts} />
      <QuickSearchModal open={showQuickSearch} onOpenChange={setShowQuickSearch}
        conversations={conversations}
        onSelectConversation={(id) => { setCurrentConversationId(id); setShowQuickSearch(false); }}
        onNewConversation={handleNewConversation}
      />

      {/* Voice Mode */}
      <VoiceModePanel
        isOpen={showVoiceMode}
        onClose={() => setShowVoiceMode(false)}
        onSendMessage={handleSend}
        lastAIResponse={lastAIMessage}
        language={language}
        isAIResponding={isLoading}
      />

      {/* Canvas Mode */}
      {canvasState?.open && (
        <CanvasMode
          content={canvasState.content}
          type={canvasState.type}
          onClose={() => setCanvasState(null)}
          onUpdate={(newContent) => setCanvasState(prev => prev ? { ...prev, content: newContent } : null)}
          onSendMessage={(msg) => handleSend(`Regarding the canvas content: ${msg}`)}
        />
      )}
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <AppSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={(id) => { setCurrentConversationId(id); setSidebarOpen(false); }}
        onNewConversation={() => { handleNewConversation(); setSidebarOpen(false); }}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => navigate("/settings")}
        onSignOut={handleSignOut}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        user={user}
      />

      <div className="flex-1 flex flex-col relative w-full max-w-full">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden rounded-lg h-9 w-9">
              <Menu size={18} />
            </Button>
            
            {activeCustomGPT ? (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-base">{activeCustomGPT.emoji}</span>
                <span className="text-xs font-semibold text-primary">{activeCustomGPT.name}</span>
                <button onClick={() => setActiveCustomGPT(null)} className="text-muted-foreground hover:text-foreground ml-1 w-4 h-4 rounded-full hover:bg-muted flex items-center justify-center text-xs">×</button>
              </div>
            ) : (
              <AIModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <ToneSelector selectedTone={selectedTone} onToneChange={setSelectedTone} />
            
            {/* Voice mode button */}
            <Button variant="ghost" size="icon" onClick={() => setShowVoiceMode(true)} className="rounded-lg h-9 w-9 text-muted-foreground hover:text-primary" title="Voice conversation">
              <Mic size={16} />
            </Button>

            {/* Canvas button - only when there are messages */}
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={handleOpenCanvas} className="rounded-lg h-9 w-9 text-muted-foreground hover:text-primary" title="Open Canvas">
                <Columns size={16} />
              </Button>
            )}
            
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-[10px] font-medium">
              <Globe size={12} className="text-primary" />
              <span className="text-foreground">{language === 'en' ? 'EN' : language === 'ha' ? 'HA' : 'PID'}</span>
            </div>
            
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-40 scrollbar-thin scroll-smooth">
          <AnimatePresence mode="wait">
            {showEmptyState ? (
              <motion.div key="empty" className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto pt-8"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <NoseSphere />
                
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 text-center">
                  {activeCustomGPT ? `Chat with ${activeCustomGPT.name}` : "What can I help with?"}
                </h2>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
                  {activeCustomGPT?.description || "Ask me anything — chat, create, translate, code 👃🏿"}
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2.5 w-full max-w-lg mx-auto">
                  {[
                    { icon: <ImagePlus className="w-4 h-4" />, title: "Create image", desc: "Describe what you want", action: () => handleSend("Create an image of a beautiful Nigerian landscape") },
                    { icon: <Sparkles className="w-4 h-4" />, title: "Surprise me", desc: "Random Nigerian fact", action: () => handleSend("Tell me an interesting fact about Nigeria") },
                    { icon: <PenLine className="w-4 h-4" />, title: "Help me write", desc: "Emails, essays & more", action: () => handleSend("Help me write a professional email") },
                    { icon: <BookOpen className="w-4 h-4" />, title: "Prompt Library", desc: "Browse templates", action: () => navigate("/prompts") },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} disabled={isLoading || isGeneratingImage}
                      className="card-premium p-3.5 flex flex-col items-start gap-1.5 text-left group hover:border-primary/20">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all text-primary">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-foreground">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Button variant="outline" onClick={() => navigate("/custom-gpt")} className="gap-1.5 rounded-lg border-border/40 text-xs h-8">
                    <Bot size={14} /> Build Custom GPT
                  </Button>
                  <Button variant="outline" onClick={() => setShowVoiceMode(true)} className="gap-1.5 rounded-lg border-border/40 text-xs h-8">
                    <Mic size={14} /> Voice Chat
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-5">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[9px] border border-border/40">⌘K</kbd> for quick actions
                </p>
              </motion.div>
            ) : (
              <motion.div key="messages" className="max-w-3xl mx-auto pt-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {messages.map((msg, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.03 }}>
                    <MessageBubbleV2
                      role={msg.role}
                      content={msg.content}
                      thought={msg.thought}
                      images={msg.images}
                      confidence={msg.confidence}
                      sources={msg.sources}
                      language={language}
                      onRegenerate={msg.role === 'assistant' && index === messages.length - 1 ? regenerateLastMessage : undefined}
                      onEdit={msg.role === 'user' ? (newContent) => editMessage(index, newContent) : undefined}
                    />
                  </motion.div>
                ))}
                
                {/* Image generation loading */}
                {pendingImagePrompt && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                        <span className="text-sm">👃🏿</span>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 flex flex-col items-center justify-center gap-3 min-h-[180px] flex-1 max-w-md">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Creating your image...</p>
                        <p className="text-xs text-muted-foreground/70 max-w-[200px] text-center truncate">"{pendingImagePrompt}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isLoading && !pendingImagePrompt && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                      <span className="text-sm">👃🏿</span>
                    </div>
                    <ThinkingIndicatorV2 />
                    {isStreaming && (
                      <Button variant="outline" size="sm" onClick={stopGeneration}
                        className="ml-auto flex items-center gap-1.5 rounded-lg border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs">
                        <Square size={10} className="fill-current" /> Stop
                      </Button>
                    )}
                  </div>
                )}
                
                {!isLoading && lastAIMessage && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                  <SmartReplySuggestions lastMessage={lastAIMessage} messageType={detectMessageType(lastAIMessage)} onSuggestionClick={handleSend} />
                )}
                
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Input */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-6 z-20">
          <FloatingInputV2
            onSend={handleSend}
            disabled={isLoading || isGeneratingImage}
            language={language}
            placeholder={activeCustomGPT ? `Ask ${activeCustomGPT.name}...` : "Message Hanchi..."}
            onInputChange={setCurrentInputText}
            inputValue={currentInputText}
          />
        </div>
      </div>
    </motion.div>
  );
}
