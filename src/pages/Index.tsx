import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { SimpleQuickActions } from "@/components/SimpleQuickActions";
import { TypingIndicator } from "@/components/TypingIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ShareConversationDialog } from "@/components/ShareConversationDialog";
import { Menu, Camera, User as UserIcon, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { analytics } from "@/utils/analytics";
import { conversationExporter } from "@/utils/conversationExporter";
import { useToast } from "@/hooks/use-toast";
import hanchiLogo from "@/assets/hanchi-logo-new.png";

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState<User | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { conversations, isLoading: loadingHistory, createConversation, deleteConversation } = 
    useConversationHistory(user?.id || null);
  const { messages, isLoading, sendMessage, regenerateLastMessage, editMessage } = 
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

  const handleExport = async (format: 'text' | 'markdown' | 'pdf') => {
    if (messages.length === 0) return;
    
    const conversationTitle = conversations.find(c => c.id === currentConversationId)?.title || 'Hanchi Conversation';
    
    try {
      if (format === 'pdf') {
        const blob = await conversationExporter.exportAsPDF(messages, conversationTitle);
        conversationExporter.downloadFile(blob, conversationTitle, 'pdf');
      } else if (format === 'markdown') {
        const content = conversationExporter.exportAsMarkdown(messages, conversationTitle);
        conversationExporter.downloadFile(content, conversationTitle, 'markdown');
      } else {
        const content = conversationExporter.exportAsText(messages, conversationTitle);
        conversationExporter.downloadFile(content, conversationTitle, 'text');
      }
      
      toast({
        title: "Export successful",
        description: `Conversation exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export conversation",
        variant: "destructive",
      });
    }
  };

  const currentConversationTitle = conversations.find(c => c.id === currentConversationId)?.title || 'New Conversation';

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
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 transition-transform duration-200`}>
        <ConversationSidebar
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
          isLoading={loadingHistory}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean ChatGPT-style Header */}
        <header className="fixed md:relative top-0 left-0 right-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1 justify-center md:justify-start">
            <span className="font-semibold text-lg">Hanchi AI 👃🏿</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Camera className="w-5 h-5" />
            </Button>
            
            <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-center mb-8">
                  What can I help with?
                </h1>
                
                <SimpleQuickActions
                  onAction={async (prompt) => {
                    if (prompt === "more_options") {
                      // Show more options in future
                      toast({ title: "More options coming soon!" });
                      return;
                    }
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
                onRegenerate={
                  message.role === 'assistant' && index === messages.length - 1
                    ? regenerateLastMessage
                    : undefined
                }
                onSuggestionClick={
                  message.role === 'assistant' && index === messages.length - 1
                    ? async (suggestion) => {
                        if (!currentConversationId) {
                          const convId = await createConversation(suggestion.slice(0, 50), language);
                          if (convId) setCurrentConversationId(convId);
                        }
                        await sendMessage(suggestion);
                      }
                    : undefined
                }
                onIteration={
                  message.role === 'assistant' && index === messages.length - 1
                    ? async (instruction) => {
                        if (!currentConversationId) {
                          const convId = await createConversation(instruction.slice(0, 50), language);
                          if (convId) setCurrentConversationId(convId);
                        }
                        await sendMessage(instruction);
                      }
                    : undefined
                }
                onEdit={
                  message.role === 'user'
                    ? () => {
                        // Edit functionality to be implemented
                        toast({ title: "Edit feature coming soon!" });
                      }
                    : undefined
                }
              />
            ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="fixed md:relative bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
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

      {currentConversationId && (
        <ShareConversationDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          conversationId={currentConversationId}
          conversationTitle={currentConversationTitle}
        />
      )}
    </div>
  );
}
