export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          extracted_text: string | null
          file_size: number | null
          file_type: string
          id: string
          metadata: Json | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_size?: number | null
          file_type: string
          id?: string
          metadata?: Json | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_sources: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          relevance_score: number | null
          source_snippet: string | null
          source_timestamp: string | null
          source_title: string
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          relevance_score?: number | null
          source_snippet?: string | null
          source_timestamp?: string | null
          source_title: string
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          relevance_score?: number | null
          source_snippet?: string | null
          source_timestamp?: string | null
          source_title?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_sources_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      nigerian_knowledge: {
        Row: {
          category: string
          content: string
          content_search: unknown
          created_at: string | null
          embedding: string | null
          id: string
          language: string | null
          metadata: Json | null
          subcategory: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          content: string
          content_search?: unknown
          created_at?: string | null
          embedding?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          subcategory?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          content_search?: unknown
          created_at?: string | null
          embedding?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          subcategory?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          exam_type: string
          explanation: string | null
          id: string
          options: Json
          question: string
          subject: string
          topic: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          exam_type: string
          explanation?: string | null
          id?: string
          options: Json
          question: string
          subject: string
          topic: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          exam_type?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          subject?: string
          topic?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          memory_key: string
          memory_value: string
          source_conversation_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          memory_key: string
          memory_value: string
          source_conversation_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: string
          source_conversation_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memory_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          learning_goals: string[] | null
          notification_settings: Json | null
          preferred_language: string | null
          study_mode: boolean | null
          updated_at: string | null
          user_id: string
          voice_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          learning_goals?: string[] | null
          notification_settings?: Json | null
          preferred_language?: string | null
          study_mode?: boolean | null
          updated_at?: string | null
          user_id: string
          voice_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          learning_goals?: string[] | null
          notification_settings?: Json | null
          preferred_language?: string | null
          study_mode?: boolean | null
          updated_at?: string | null
          user_id?: string
          voice_enabled?: boolean | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string | null
          exam_type: string
          id: string
          last_practice: string | null
          questions_attempted: number | null
          questions_correct: number | null
          subject: string
          topic: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exam_type: string
          id?: string
          last_practice?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          subject: string
          topic: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exam_type?: string
          id?: string
          last_practice?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          subject?: string
          topic?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          achievements: Json | null
          badges: Json | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          badges?: Json | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          badges?: Json | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_xp_amount: number }
        Returns: undefined
      }
      match_nigerian_knowledge:
        | {
            Args: {
              filter_language?: string
              match_count?: number
              search_query: string
            }
            Returns: {
              category: string
              content: string
              id: string
              language: string
              metadata: Json
              similarity: number
              subcategory: string
            }[]
          }
        | {
            Args: {
              filter_language?: string
              match_count?: number
              match_threshold?: number
              query_embedding: string
            }
            Returns: {
              category: string
              content: string
              id: string
              language: string
              metadata: Json
              similarity: number
              subcategory: string
            }[]
          }
      upsert_user_progress: {
        Args: {
          p_exam_type: string
          p_is_correct: boolean
          p_subject: string
          p_topic: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
