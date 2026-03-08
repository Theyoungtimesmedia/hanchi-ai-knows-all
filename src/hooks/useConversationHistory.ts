import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Conversation {
  id: string;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean | null;
}

export const useConversationHistory = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [userId]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({ title: "Error", description: "Failed to load conversation history", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (title: string, language: string): Promise<string | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ title, language, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      await loadConversations();
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return null;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase.from('conversations').delete().eq('id', conversationId);
      if (error) throw error;
      await loadConversations();
      toast({ title: "Success", description: "Conversation deleted" });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
    }
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase.from('conversations').update({ title }).eq('id', conversationId);
      if (error) throw error;
      await loadConversations();
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast({ title: "Error", description: "Failed to update conversation", variant: "destructive" });
    }
  };

  const pinConversation = async (conversationId: string, pinned: boolean) => {
    try {
      const { error } = await supabase.from('conversations').update({ pinned }).eq('id', conversationId);
      if (error) throw error;
      // Optimistic update
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, pinned } : c));
      toast({ title: pinned ? "Conversation pinned 📌" : "Conversation unpinned" });
    } catch (error) {
      console.error('Error pinning conversation:', error);
      toast({ title: "Error", description: "Failed to pin conversation", variant: "destructive" });
    }
  };

  return {
    conversations,
    isLoading,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    pinConversation,
    loadConversations,
  };
};
