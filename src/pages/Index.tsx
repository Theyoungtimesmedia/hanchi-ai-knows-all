import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useUserMemory } from "@/hooks/useUserMemory";
import { MessageBubbleV2 } from "@/components/MessageBubbleV2";
import { FloatingInput } from "@/components/FloatingInput";
import { AppSidebar } from "@/components/AppSidebar";
import { ThinkingIndicatorV2 } from "@/components/ThinkingIndicatorV2";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ExpandedQuickActions } from "@/components/ExpandedQuickActions";
import { SmartReplySuggestions } from "@/components/SmartReplySuggestions";
import { Menu, Globe, ImagePlus, Sparkles, PenLine, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { analytics } from "@/utils/analytics";

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        <header className="h-16 flex items-center justify-between px-4 md:px-6 z-20 bg-background border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-xl"
            >
              <Menu size={20} />
            </Button>
            <span className="font-semibold text-lg text-foreground">Hanchi</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
              <Globe size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'en' ? 'EN' : language === 'ha' ? 'HA' : 'PG'}
              </span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-40 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">
                What can I help with?
              </h2>
              
              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
                <Button
                  variant="outline"
                  onClick={() => handleSend("Create an image of...")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex items-center gap-3 bg-card hover:bg-muted border-border rounded-full transition-colors justify-start"
                >
                  <ImagePlus className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Create image</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend("Help me write code for...")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex items-center gap-3 bg-card hover:bg-muted border-border rounded-full transition-colors justify-start"
                >
                  <Code className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Code</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend("Summarize this text: ")}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 flex items-center gap-3 bg-card hover:bg-muted border-border rounded-full transition-colors justify-start"
                >
                  <PenLine className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">Summarize text</span>
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
        <div className="absolute bottom-6 left-0 right-0 px-4 md:px-6 z-20">
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
