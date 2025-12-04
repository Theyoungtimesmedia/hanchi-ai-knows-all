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
import { ImageGenerationModal } from "@/components/ImageGenerationModal";
import { SmartReplySuggestions } from "@/components/SmartReplySuggestions";
import { ThinkBeforeTalkToggle } from "@/components/ThinkBeforeTalkToggle";
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
  const [thinkModeEnabled, setThinkModeEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  const { messages, isLoading, sendMessage, regenerateLastMessage } = 
    useChat(language, currentConversationId, user?.id || null);
  const { getMemoryContext } = useUserMemory(user?.id || null);

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

  const handleQuickAction = (prompt: string) => {
    if (prompt === "more_options") return;
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
            <div className="md:hidden font-bold text-xl text-foreground flex items-center gap-2">
              <span className="text-2xl">👃🏿</span>
              <span>Hanchi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border">
              <Globe size={16} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en' ? 'English (NG)' : language === 'ha' ? 'Hausa' : 'Pidgin'}
              </span>
            </div>
            <ImageGenerationModal 
              trigger={
                <Button variant="ghost" size="icon" className="rounded-full bg-card shadow-sm" title="Sniff out an image">
                  <ImagePlus size={20} />
                </Button>
              }
            />
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
              <NoseSphere />
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-center">
                What should I nose out? 👃🏿
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Hanchi noses out answers with precision. Multilingual, multimodal, and mindful.
              </p>
              
              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleSend("Generate an image of...")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Sniff out an image</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend("Tell me something interesting about Nigeria")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Surprise me</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend("Help me write...")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-card hover:bg-muted border-border rounded-xl transition-colors"
                >
                  <PenLine className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-foreground">Help me write</span>
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

        {/* Think Before Talk Toggle & Floating Input */}
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-10 flex flex-col items-center z-20">
          {messages.length === 0 && (
            <ThinkBeforeTalkToggle
              enabled={thinkModeEnabled}
              onToggle={setThinkModeEnabled}
              isThinking={isLoading}
            />
          )}
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
