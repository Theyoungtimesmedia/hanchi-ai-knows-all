import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [language, setLanguage] = useState("en");
  const { messages, isLoading, sendMessage, clearMessages } = useChat(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceClick = () => {
    toast({
      title: "Voice input",
      description: "Voice recording feature coming soon!",
    });
  };

  const handleImageClick = () => {
    toast({
      title: "Image upload",
      description: "Image analysis feature coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-warm">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Hanchi AI
              </h1>
              <p className="text-xs text-muted-foreground">Your intelligent assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector language={language} onLanguageChange={setLanguage} />
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-6">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Hanchi AI
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Your multilingual AI assistant that "noses out" answers. Ask me anything in English, Hausa, or Pidgin!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {[
                "Tell me a joke",
                "Translate to Hausa",
                "Help with coding",
                "Search the web",
              ].map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start hover:bg-muted hover:shadow-sm transition-all"
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 pt-4">
          <ChatInput
            onSend={sendMessage}
            disabled={isLoading}
            onVoiceClick={handleVoiceClick}
            onImageClick={handleImageClick}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
