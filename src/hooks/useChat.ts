import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/utils/analytics";
import { performanceMonitor } from "@/utils/performance";

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
  thought?: string;
  id?: string;
}

export const useChat = (language: string, conversationId: string | null, userId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

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
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        images: (msg.metadata as any)?.images || [],
        confidence: (msg.metadata as any)?.confidence,
        sources: (msg.metadata as any)?.sources || [],
        thought: (msg.metadata as any)?.thought,
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
      if (message.thought) metadata.thought = message.thought;

      await supabase.from('messages').insert({
        conversation_id: convId,
        role: message.role,
        content: message.content,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      });

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Generate auto-title from first message
  const generateTitle = async (content: string, convId: string) => {
    if (!convId) return;
    
    // Create a smart title from the first message (max 50 chars)
    let title = content.trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    try {
      await supabase
        .from('conversations')
        .update({ title })
        .eq('id', convId);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  // Stop streaming response
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      analytics.trackChatMessage('user', content.length);
      performanceMonitor.startTimer('chat_response');
      
      const userMessage: Message = { role: "user", content, images };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsStreaming(true);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        if (conversationId && userId) {
          await saveMessage(userMessage, conversationId);
          
          // Auto-generate title for first message
          if (messages.length === 0) {
            await generateTitle(content, conversationId);
          }
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
            userMemory: "",
          }),
          signal: abortControllerRef.current.signal,
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
        let assistantMetadata: { confidence?: number; sources?: Source[]; thought?: string } = {};

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
                
                if (metadata) {
                  if (metadata.confidence !== undefined) {
                    assistantMetadata.confidence = metadata.confidence;
                  }
                  if (metadata.sources) {
                    assistantMetadata.sources = metadata.sources;
                  }
                  if (metadata.thought) {
                    assistantMetadata.thought = metadata.thought;
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

        if (conversationId && userId && assistantContent) {
          await saveMessage({ 
            role: "assistant", 
            content: assistantContent,
            ...assistantMetadata,
          }, conversationId);
        }
        
        performanceMonitor.endTimer('chat_response');
        analytics.trackChatMessage('assistant', assistantContent.length);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        analytics.trackError('chat_send_failed', { error: String(error) });
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, language, toast, conversationId, userId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const regenerateLastMessage = useCallback(async () => {
    if (messages.length < 2) return;

    const messagesWithoutLast = messages.slice(0, -1);
    setMessages(messagesWithoutLast);

    const lastUserMessage = messagesWithoutLast[messagesWithoutLast.length - 1];
    if (lastUserMessage.role !== 'user') return;

    await sendMessage(lastUserMessage.content, lastUserMessage.images);
  }, [messages, sendMessage]);

  const editMessage = useCallback(async (index: number, newContent: string) => {
    if (index < 0 || index >= messages.length) return;
    if (messages[index].role !== 'user') return;

    const messagesUpToEdit = messages.slice(0, index);
    setMessages(messagesUpToEdit);

    await sendMessage(newContent, messages[index].images);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearMessages,
    regenerateLastMessage,
    editMessage,
    stopGeneration,
  };
};