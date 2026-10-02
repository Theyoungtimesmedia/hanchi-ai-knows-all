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
import { EmptyState } from "@/components/EmptyState";
import { ThinkingIndicatorV2 } from "@/components/ThinkingIndicatorV2";
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

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation, pinConversation } = 
    useConversationHistory(user?.id || null);
  
  const { getMemoryContext, addMemory } = useUserMemory(user?.id || null);

  const chatOptions = {
    model: selectedModel,
    tone: selectedTone,
    thinkMode: activeAddons.thinking || false,
    searchWeb: activeAddons.search || false,
    deepResearch: activeAddons.deepResearch || false,
    customSystemPrompt: activeCustomGPT?.systemPrompt || "",
    userMemory: getMemoryContext(),
  };
  
  const { messages, isLoading, isStreaming, sendMessage, addMessage, regenerateLastMessage, editMessage, stopGeneration } = 
    useChat(language, currentConversationId, user?.id || null, chatOptions);

  useEffect(() => {
    const saved = sessionStorage.getItem('hanchi_active_custom_gpt');
    if (saved) {
      try { setActiveCustomGPT(JSON.parse(saved)); sessionStorage.removeItem('hanchi_active_custom_gpt'); } catch (e) {}
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
        } else { navigate("/auth"); return; }
      } catch (error) { console.error("Auth initialization error:", error); navigate("/auth"); return; }
      setIsInitialized(true);
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) { setUser(null); navigate("/auth"); }
      else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') { setUser(session.user); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    supabase.from("announcements").select("id, title, content").eq("is_active", true)
      .then(({ data }) => { if (data) setAnnouncements(data); });
  }, []);

  useEffect(() => {
    if (!isInitialized || !user) return;
    const prefillPrompt = sessionStorage.getItem('hanchi_prefill_prompt');
    if (prefillPrompt) { sessionStorage.removeItem('hanchi_prefill_prompt'); setTimeout(() => handleSend(prefillPrompt), 100); }
  }, [isInitialized, user]);

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
    if (!currentConversationId) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      createConversation(title, language).then(convId => { if (convId) setCurrentConversationId(convId); });
    }
    const imageCommand = detectImageCommand(content);
    if (imageCommand.type) {
      const isSticker = imageCommand.type === 'sticker';
      addMessage({ role: "user", content });
      setPendingImagePrompt(imageCommand.prompt);
      const result = await generateImage(imageCommand.prompt, isSticker ? 'sticker' : 'default', isSticker);
      setPendingImagePrompt(null);
      if (result?.url) { addMessage({ role: "assistant", content: `Here's what I created for "${imageCommand.prompt}"`, images: [result.url] }); }
      else { addMessage({ role: "assistant", content: "Sorry, I couldn't generate that image. Try again?" }); }
      return;
    }
    await sendMessage(content, images);
  };

  const handleOpenCanvas = useCallback(() => {
    const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAI) return;
    const hasCode = lastAI.content.includes('```');
    setCanvasState({ open: true, content: hasCode ? lastAI.content.replace(/```\w*\n?/g, '').replace(/```/g, '') : lastAI.content, type: hasCode ? "code" : "document" });
  }, [messages]);

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  const detectMessageType = (content: string): 'code' | 'text' | 'list' | 'table' | 'explanation' => {
    if (content.includes('```')) return 'code';
    if (content.includes('|') && content.includes('---')) return 'table';
    if ((content.match(/^\s*[-*•]\s/gm) || []).length >= 3) return 'list';
    if (content.length > 500) return 'explanation';
    return 'text';
  };

  const getLastAIMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) { if (messages[i].role === 'assistant') return messages[i].content; }
    return '';
  };

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const lastAIMessage = getLastAIMessage();
  const showEmptyState = messages.length === 0 && !isCreatingConversation;

  return (
    <motion.div className="flex h-screen bg-background overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
      <OfflineIndicator />
      
      <KeyboardShortcutsModal open={showShortcuts} onOpenChange={setShowShortcuts} />
      <QuickSearchModal open={showQuickSearch} onOpenChange={setShowQuickSearch}
        conversations={conversations}
        onSelectConversation={(id) => { setCurrentConversationId(id); setShowQuickSearch(false); }}
        onNewConversation={handleNewConversation}
      />
      <VoiceModePanel isOpen={showVoiceMode} onClose={() => setShowVoiceMode(false)} onSendMessage={handleSend} lastAIResponse={lastAIMessage} language={language} isAIResponding={isLoading} />
      {canvasState?.open && (
        <CanvasMode content={canvasState.content} type={canvasState.type} onClose={() => setCanvasState(null)}
          onUpdate={(newContent) => setCanvasState(prev => prev ? { ...prev, content: newContent } : null)}
          onSendMessage={(msg) => handleSend(`Regarding the canvas content: ${msg}`)} />
      )}
      
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <AppSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={(id) => { setCurrentConversationId(id); setSidebarOpen(false); }}
        onNewConversation={() => { handleNewConversation(); setSidebarOpen(false); }}
        onDeleteConversation={deleteConversation}
        onPinConversation={pinConversation}
        onOpenSettings={() => navigate("/settings")}
        onSignOut={handleSignOut}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        user={user}
        onOpenImageGen={() => setShowImageGen(true)}
        onOpenVoiceTranslation={() => setShowTranslation(true)}
        onExportChat={() => toast({ title: "Export", description: "Export feature coming soon" })}
      />

      <Dialog open={showImageGen} onOpenChange={setShowImageGen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-0">
          <ImageGenerationModal onImageGenerated={(url) => { handleSend(`Here's the image I created`); setShowImageGen(false); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={showTranslation} onOpenChange={setShowTranslation}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none">
          <VoiceTranslationPanel onClose={() => setShowTranslation(false)} />
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative w-full max-w-full h-screen">
        {/* Announcement Banner */}
        {announcements.filter(a => !dismissedAnnouncements.has(a.id)).slice(0, 1).map((ann) => (
          <div key={ann.id} className="bg-primary/6 border-b border-primary/10 px-4 py-2 flex items-center gap-2.5 flex-shrink-0">
            <Bell size={14} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{ann.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{ann.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md flex-shrink-0"
              onClick={() => {
                const newDismissed = new Set(dismissedAnnouncements);
                newDismissed.add(ann.id);
                setDismissedAnnouncements(newDismissed);
                localStorage.setItem('hanchi_dismissed_announcements', JSON.stringify([...newDismissed]));
              }}>
              <X size={12} />
            </Button>
          </div>
        ))}

        {/* Header — ultra thin */}
        <header className="h-11 flex items-center justify-between px-3 md:px-4 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden rounded-md h-8 w-8">
              <Menu size={16} />
            </Button>
            {activeCustomGPT ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/8 border border-primary/12">
                <span className="text-sm">{activeCustomGPT.emoji}</span>
                <span className="text-xs font-medium text-primary">{activeCustomGPT.name}</span>
                <button onClick={() => setActiveCustomGPT(null)} className="text-muted-foreground hover:text-foreground ml-0.5 text-xs">×</button>
              </div>
            ) : (
              <AIModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            )}
          </div>
          <div className="flex items-center gap-1">
            <ToneSelector selectedTone={selectedTone} onToneChange={setSelectedTone} />
            <Button variant="ghost" size="icon" onClick={() => setShowVoiceMode(true)} className="rounded-md h-8 w-8 text-muted-foreground hover:text-primary" title="Voice"><Mic size={14} /></Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={handleOpenCanvas} className="rounded-md h-8 w-8 text-muted-foreground hover:text-primary" title="Canvas"><Columns size={14} /></Button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 scrollbar-thin scroll-smooth min-h-0">
          <AnimatePresence mode="wait">
            {showEmptyState ? (
              <motion.div key="empty" className="h-full flex flex-col items-center justify-center max-w-lg mx-auto py-8"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <EmptyState />
                <h2 className="font-serif-display text-3xl md:text-4xl font-medium text-foreground mb-2 text-center tracking-tight">
                  {activeCustomGPT ? `Chat with ${activeCustomGPT.name}` : "How can I help you today?"}
                </h2>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
                  {activeCustomGPT?.description || "Ask anything — chat, create, translate, code"}
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md mx-auto">
                  {[
                    { icon: <ImagePlus className="w-4 h-4" />, title: "Create image", desc: "From a text prompt", action: () => handleSend("Create an image of a beautiful Nigerian landscape") },
                    { icon: <Sparkles className="w-4 h-4" />, title: "Surprise me", desc: "Random fact", action: () => handleSend("Tell me an interesting fact about Nigeria") },
                    { icon: <PenLine className="w-4 h-4" />, title: "Help me write", desc: "Emails & essays", action: () => handleSend("Help me write a professional email") },
                    { icon: <BookOpen className="w-4 h-4" />, title: "Prompts", desc: "Browse templates", action: () => navigate("/prompts") },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} disabled={isLoading || isGeneratingImage}
                      className="p-3 rounded-lg border border-border/40 bg-card/50 hover:border-border hover:bg-card text-left transition-all duration-150 group">
                      <div className="w-7 h-7 rounded-md bg-primary/8 flex items-center justify-center mb-2 group-hover:bg-primary/12 transition-colors text-primary">
                        {item.icon}
                      </div>
                      <span className="text-xs font-medium text-foreground block">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <Button variant="outline" size="sm" onClick={() => navigate("/custom-gpt")} className="gap-1.5 rounded-md border-border/40 text-xs h-7"><Bot size={12} /> Custom GPT</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowVoiceMode(true)} className="gap-1.5 rounded-md border-border/40 text-xs h-7"><Mic size={12} /> Voice</Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4">
                  <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[9px] border border-border/40">⌘K</kbd> quick actions
                </p>
              </motion.div>
            ) : (
              <motion.div key="messages" className="max-w-2xl mx-auto pt-3 pb-3"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                {messages.map((msg, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: index * 0.02 }}>
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
                
                {pendingImagePrompt && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="rounded-xl border border-border/40 bg-muted/20 p-5 flex flex-col items-center justify-center gap-2.5 min-h-[140px] flex-1 max-w-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Creating image…</p>
                        <p className="text-[10px] text-muted-foreground/60 max-w-[180px] text-center truncate">"{pendingImagePrompt}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isLoading && !pendingImagePrompt && (
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <ThinkingIndicatorV2 />
                    {isStreaming && (
                      <Button variant="outline" size="sm" onClick={stopGeneration}
                        className="ml-auto flex items-center gap-1 rounded-md border-border/40 hover:bg-destructive/8 hover:text-destructive hover:border-destructive/20 text-xs h-7">
                        <Square size={8} className="fill-current" /> Stop
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

        {/* Input */}
        <div className="flex-shrink-0 px-3 md:px-4 py-2.5 bg-background/80 backdrop-blur-xl border-t border-border/20">
          <FloatingInputV2
            onSend={handleSend}
            disabled={isLoading || isGeneratingImage}
            language={language}
            placeholder={activeCustomGPT ? `Ask ${activeCustomGPT.name}...` : "Message Hanchi…"}
            onInputChange={setCurrentInputText}
            inputValue={currentInputText}
          />
        </div>
      </div>
    </motion.div>
  );
}
