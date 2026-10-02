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

interface ChatOptions {
  model?: string;
  tone?: string;
  thinkMode?: boolean;
  searchWeb?: boolean;
  deepResearch?: boolean;
  customSystemPrompt?: string;
  userMemory?: string;
}

export const useChat = (
  language: string, 
  conversationId: string | null, 
  userId: string | null,
  options?: ChatOptions
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const extractErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();
      return data?.error || data?.message || "Failed to get response";
    } catch {
      return "Failed to get response";
    }
  };

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

  const generateTitle = async (content: string, convId: string) => {
    if (!convId) return;
    
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

      abortControllerRef.current = new AbortController();

      try {
        if (conversationId && userId) {
          await saveMessage(userMessage, conversationId);
          
          if (messages.length === 0) {
            await generateTitle(content, conversationId);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
        
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            language,
            images: images || [],
            searchWeb: options?.searchWeb ?? false,
            userMemory: options?.userMemory || "",
            model: options?.model || "gemini-flash",
            tone: options?.tone || "default",
            thinkMode: options?.thinkMode ?? false,
            deepResearch: options?.deepResearch ?? false,
            customSystemPrompt: options?.customSystemPrompt || "",
            learnUserData: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorMessage = await extractErrorMessage(response);
          if (response.status === 429) {
            toast({
              title: "Rate limit exceeded",
              description: errorMessage,
              variant: "destructive",
            });
            setMessages((prev) => prev.slice(0, -1));
            return;
          }
          if (response.status === 402) {
            toast({
              title: "Service limit reached",
              description: errorMessage,
              variant: "destructive",
            });
            setMessages((prev) => prev.slice(0, -1));
            return;
          }
          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let assistantMetadata: { confidence?: number; sources?: Source[]; thought?: string } = {};
        let textBuffer = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              const metadata = parsed.metadata;

              if (content) assistantContent += content;

              if (metadata) {
                if (metadata.confidence !== undefined) assistantMetadata.confidence = metadata.confidence;
                if (metadata.sources) assistantMetadata.sources = metadata.sources;
                if (metadata.thought) assistantMetadata.thought = metadata.thought;
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
            } catch {
              textBuffer = `${line}\n${textBuffer}`;
              break;
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
    [messages, language, toast, conversationId, userId, options]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
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
    addMessage,
    regenerateLastMessage,
    editMessage,
    stopGeneration,
  };
};
