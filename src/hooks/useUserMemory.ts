import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Memory {
  id: string;
  memory_key: string;
  memory_value: string;
  category: string | null;
  confidence_score: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUserMemory = (userId: string | null) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadMemories = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_memory')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const addMemory = useCallback(async (key: string, value: string, category?: string) => {
    if (!userId) return null;

    try {
      // Check if memory with this key already exists
      const { data: existing } = await supabase
        .from('user_memory')
        .select('id')
        .eq('user_id', userId)
        .eq('memory_key', key)
        .single();

      if (existing) {
        // Update existing memory
        const { data, error } = await supabase
          .from('user_memory')
          .update({ 
            memory_value: value, 
            category: category || 'general',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        await loadMemories();
        return data;
      } else {
        // Create new memory
        const { data, error } = await supabase
          .from('user_memory')
          .insert({
            user_id: userId,
            memory_key: key,
            memory_value: value,
            category: category || 'general',
          })
          .select()
          .single();

        if (error) throw error;
        await loadMemories();
        return data;
      }
    } catch (error) {
      console.error('Error adding memory:', error);
      toast({
        title: "Error",
        description: "Failed to save memory",
        variant: "destructive",
      });
      return null;
    }
  }, [userId, loadMemories, toast]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_memory')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', userId);

      if (error) throw error;
      
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      toast({
        title: "Memory deleted",
        description: "Hanchi has forgotten this information.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      });
      return false;
    }
  }, [userId, toast]);

  const getMemoryContext = useCallback(() => {
    if (memories.length === 0) return "";

    const contextLines = memories.map(m => `- ${m.memory_key}: ${m.memory_value}`);
    return `\n\nUSER MEMORIES (What Hanchi remembers about this user):\n${contextLines.join('\n')}`;
  }, [memories]);

  return {
    memories,
    loading,
    addMemory,
    deleteMemory,
    getMemoryContext,
    refreshMemories: loadMemories,
  };
};
