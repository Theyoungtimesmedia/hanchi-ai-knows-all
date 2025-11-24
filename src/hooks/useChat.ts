import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Source {
  title: string;
  url?: string;
  snippet?: string;
  timestamp?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[];
  confidence?: number;
  sources?: Source[];
}

export const useChat = (language: string, conversationId: string | null, userId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && userId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId, userId]);

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        images: (msg.metadata as any)?.images || [],
        confidence: (msg.metadata as any)?.confidence,
        sources: (msg.metadata as any)?.sources || [],
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const saveMessage = async (message: Message, convId: string) => {
    if (!userId) return;

    try {
      const metadata: any = {};
      if (message.images) metadata.images = message.images;
      if (message.confidence) metadata.confidence = message.confidence;
      if (message.sources) metadata.sources = message.sources;

      await supabase.from('messages').insert({
        conversation_id: convId,
        role: message.role,
        content: message.content,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      });

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      const userMessage: Message = { role: "user", content, images };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Save user message if we have a conversation
        if (conversationId && userId) {
          await saveMessage(userMessage, conversationId);
        }

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
        
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            language,
            images: images || [],
            searchWeb: true,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            toast({
              title: "Rate limit exceeded",
              description: "Please try again in a moment.",
              variant: "destructive",
            });
            return;
          }
          if (response.status === 402) {
            toast({
              title: "Service unavailable",
              description: "Please contact support.",
              variant: "destructive",
            });
            return;
          }
          throw new Error("Failed to get response");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let assistantMetadata: { confidence?: number; sources?: Source[] } = {};

        // Add assistant message placeholder
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                const metadata = parsed.metadata;
                
                if (content) {
                  assistantContent += content;
                }
                
                // Update metadata if present
                if (metadata) {
                  if (metadata.confidence !== undefined) {
                    assistantMetadata.confidence = metadata.confidence;
                  }
                  if (metadata.sources) {
                    assistantMetadata.sources = metadata.sources;
                  }
                }
                
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    ...assistantMetadata,
                  };
                  return newMessages;
                });
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Save assistant message if we have a conversation
        if (conversationId && userId && assistantContent) {
          await saveMessage({ 
            role: "assistant", 
            content: assistantContent,
            ...assistantMetadata,
          }, conversationId);
        }
      } catch (error) {
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        // Remove the failed message attempt
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, language, toast, conversationId, userId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
