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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_by: string | null
          created_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_by?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_by?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brain_records: {
        Row: {
          captured_at: string
          company: string | null
          confidence_score: number
          content: string
          created_at: string
          domain: string | null
          event_date: string | null
          id: string
          layer: string
          person: string | null
          project: string | null
          provenance: string | null
          record_type: string
          source_name: string | null
          source_type: string | null
          status: string
          superseded_by: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          captured_at?: string
          company?: string | null
          confidence_score?: number
          content: string
          created_at?: string
          domain?: string | null
          event_date?: string | null
          id?: string
          layer?: string
          person?: string | null
          project?: string | null
          provenance?: string | null
          record_type?: string
          source_name?: string | null
          source_type?: string | null
          status?: string
          superseded_by?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          captured_at?: string
          company?: string | null
          confidence_score?: number
          content?: string
          created_at?: string
          domain?: string | null
          event_date?: string | null
          id?: string
          layer?: string
          person?: string | null
          project?: string | null
          provenance?: string | null
          record_type?: string
          source_name?: string | null
          source_type?: string | null
          status?: string
          superseded_by?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_records_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "brain_records"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string | null
          id: string
          item_content: string | null
          item_id: string
          item_metadata: Json | null
          item_type: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          id?: string
          item_content?: string | null
          item_id: string
          item_metadata?: Json | null
          item_type: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          id?: string
          item_content?: string | null
          item_id?: string
          item_metadata?: Json | null
          item_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          sample_messages: Json | null
          system_prompt: string
          title: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          sample_messages?: Json | null
          system_prompt: string
          title: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          sample_messages?: Json | null
          system_prompt?: string
          title?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          pinned: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          pinned?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          pinned?: boolean | null
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
      flagged_users: {
        Row: {
          created_at: string | null
          flagged_by: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          image_base64: string | null
          image_url: string | null
          metadata: Json | null
          prompt: string
          style: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          image_base64?: string | null
          image_url?: string | null
          metadata?: Json | null
          prompt: string
          style?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          image_base64?: string | null
          image_url?: string | null
          metadata?: Json | null
          prompt?: string
          style?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_agent_runs: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          error: string | null
          goal: string
          id: string
          max_steps: number
          plan: Json
          project_id: string | null
          result: Json | null
          started_at: string | null
          status: string
          step_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          goal: string
          id?: string
          max_steps?: number
          plan?: Json
          project_id?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          step_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          goal?: string
          id?: string
          max_steps?: number
          plan?: Json
          project_id?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          step_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_agent_runs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_agent_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanchi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_agent_steps: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          input: Json | null
          kind: string
          output: Json | null
          requires_approval: boolean
          run_id: string
          started_at: string | null
          status: string
          step_index: number
          tool_name: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          input?: Json | null
          kind: string
          output?: Json | null
          requires_approval?: boolean
          run_id: string
          started_at?: string | null
          status?: string
          step_index: number
          tool_name?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          input?: Json | null
          kind?: string
          output?: Json | null
          requires_approval?: boolean
          run_id?: string
          started_at?: string | null
          status?: string
          step_index?: number
          tool_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_agent_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "hanchi_agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_artifact_versions: {
        Row: {
          artifact_id: string
          content: string
          created_at: string
          id: string
          metadata: Json
          user_id: string
          version: number
        }
        Insert: {
          artifact_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id: string
          version: number
        }
        Update: {
          artifact_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_artifact_versions_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "hanchi_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_artifacts: {
        Row: {
          artifact_type: string
          content: string
          conversation_id: string | null
          created_at: string
          file_name: string
          id: string
          language: string | null
          metadata: Json
          mime_type: string
          preview_mode: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          artifact_type?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          file_name: string
          id?: string
          language?: string | null
          metadata?: Json
          mime_type?: string
          preview_mode?: string
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          artifact_type?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          file_name?: string
          id?: string
          language?: string | null
          metadata?: Json
          mime_type?: string
          preview_mode?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_artifacts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanchi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_brain_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json
          project_id: string | null
          source_id: string | null
          source_type: string
          title: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          project_id?: string | null
          source_id?: string | null
          source_type: string
          title?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          project_id?: string | null
          source_id?: string | null
          source_type?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_brain_chunks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanchi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_connector_tools: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          input_schema: Json
          operation: string
          provider: string
          requires_approval: boolean
          tool_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          input_schema?: Json
          operation?: string
          provider: string
          requires_approval?: boolean
          tool_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          input_schema?: Json
          operation?: string
          provider?: string
          requires_approval?: boolean
          tool_name?: string
        }
        Relationships: []
      }
      hanchi_connectors: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          id: string
          last_used_at: string | null
          provider: string
          scopes: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          id?: string
          last_used_at?: string | null
          provider: string
          scopes?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          last_used_at?: string | null
          provider?: string
          scopes?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hanchi_daily_briefings: {
        Row: {
          bible_reference: string | null
          bible_text: string | null
          briefing_date: string
          created_at: string
          id: string
          note: string | null
          priorities: Json
          schedule: Json
          user_id: string
          word_of_day: string | null
        }
        Insert: {
          bible_reference?: string | null
          bible_text?: string | null
          briefing_date: string
          created_at?: string
          id?: string
          note?: string | null
          priorities?: Json
          schedule?: Json
          user_id: string
          word_of_day?: string | null
        }
        Update: {
          bible_reference?: string | null
          bible_text?: string | null
          briefing_date?: string
          created_at?: string
          id?: string
          note?: string | null
          priorities?: Json
          schedule?: Json
          user_id?: string
          word_of_day?: string | null
        }
        Relationships: []
      }
      hanchi_events: {
        Row: {
          body: string
          captured_at: string
          confidence: number
          entity_ids: string[]
          event_date: string | null
          event_time: string | null
          id: string
          kind: string
          project_id: string | null
          search_text: unknown
          source_ref: string | null
          source_type: string | null
          status: string
          supersedes_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          captured_at?: string
          confidence?: number
          entity_ids?: string[]
          event_date?: string | null
          event_time?: string | null
          id?: string
          kind: string
          project_id?: string | null
          search_text?: unknown
          source_ref?: string | null
          source_type?: string | null
          status?: string
          supersedes_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          captured_at?: string
          confidence?: number
          entity_ids?: string[]
          event_date?: string | null
          event_time?: string | null
          id?: string
          kind?: string
          project_id?: string | null
          search_text?: unknown
          source_ref?: string | null
          source_type?: string | null
          status?: string
          supersedes_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanchi_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_events_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "hanchi_events"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_knowledge_items: {
        Row: {
          captured_at: string
          category: string
          confidence: number
          id: string
          key: string
          project_id: string | null
          scope: string
          search_text: unknown
          source_id: string | null
          source_ref: string | null
          source_type: string | null
          status: string
          supersedes_id: string | null
          updated_at: string
          user_id: string
          valid_from: string | null
          value: string
        }
        Insert: {
          captured_at?: string
          category?: string
          confidence?: number
          id?: string
          key: string
          project_id?: string | null
          scope?: string
          search_text?: unknown
          source_id?: string | null
          source_ref?: string | null
          source_type?: string | null
          status?: string
          supersedes_id?: string | null
          updated_at?: string
          user_id: string
          valid_from?: string | null
          value: string
        }
        Update: {
          captured_at?: string
          category?: string
          confidence?: number
          id?: string
          key?: string
          project_id?: string | null
          scope?: string
          search_text?: unknown
          source_id?: string | null
          source_ref?: string | null
          source_type?: string | null
          status?: string
          supersedes_id?: string | null
          updated_at?: string
          user_id?: string
          valid_from?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_knowledge_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanchi_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_knowledge_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "hanchi_knowledge_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_knowledge_items_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "hanchi_knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_knowledge_sources: {
        Row: {
          content: string | null
          content_sha256: string | null
          created_at: string
          id: string
          kind: string
          metadata: Json
          source_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          content_sha256?: string | null
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          source_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          content_sha256?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          source_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hanchi_model_catalog: {
        Row: {
          alias: string
          capabilities: Json
          created_at: string
          enabled: boolean
          free_tier: boolean
          id: string
          label: string
          metadata: Json
          model_id: string
          priority: number
          provider: string
          updated_at: string
        }
        Insert: {
          alias: string
          capabilities?: Json
          created_at?: string
          enabled?: boolean
          free_tier?: boolean
          id?: string
          label: string
          metadata?: Json
          model_id: string
          priority?: number
          provider: string
          updated_at?: string
        }
        Update: {
          alias?: string
          capabilities?: Json
          created_at?: string
          enabled?: boolean
          free_tier?: boolean
          id?: string
          label?: string
          metadata?: Json
          model_id?: string
          priority?: number
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      hanchi_model_runs: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          error: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model: string
          output_tokens: number | null
          parent_run_id: string | null
          provider: string
          result: Json | null
          role: string
          status: string
          task: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model: string
          output_tokens?: number | null
          parent_run_id?: string | null
          provider: string
          result?: Json | null
          role: string
          status?: string
          task?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string
          output_tokens?: number | null
          parent_run_id?: string | null
          provider?: string
          result?: Json | null
          role?: string
          status?: string
          task?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_model_runs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_model_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "hanchi_model_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_owner_config: {
        Row: {
          created_at: string
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hanchi_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          metadata: Json
          name: string
          slug: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json
          name: string
          slug?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json
          name?: string
          slug?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hanchi_skills: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          instructions: string
          name: string
          slug: string
          tools: Json
          triggers: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          instructions?: string
          name: string
          slug: string
          tools?: Json
          triggers?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          instructions?: string
          name?: string
          slug?: string
          tools?: Json
          triggers?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hanchi_tool_runs: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          connector_id: string | null
          conversation_id: string | null
          created_at: string
          id: string
          input: Json
          output: Json | null
          requires_approval: boolean
          status: string
          tool_name: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          connector_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          input?: Json
          output?: Json | null
          requires_approval?: boolean
          status?: string
          tool_name: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          connector_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          input?: Json
          output?: Json | null
          requires_approval?: boolean
          status?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_tool_runs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "hanchi_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hanchi_tool_runs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_usage_events: {
        Row: {
          capability: string | null
          conversation_id: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          metadata: Json
          model: string | null
          output_tokens: number | null
          provider: string | null
          status: string
          user_id: string
        }
        Insert: {
          capability?: string | null
          conversation_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json
          model?: string | null
          output_tokens?: number | null
          provider?: string | null
          status?: string
          user_id: string
        }
        Update: {
          capability?: string | null
          conversation_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json
          model?: string | null
          output_tokens?: number | null
          provider?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanchi_usage_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hanchi_user_settings: {
        Row: {
          auto_archive_enabled: boolean
          auto_memory_enabled: boolean
          created_at: string
          default_effort: string
          locale: string
          metadata: Json
          morning_enabled: boolean
          morning_time: string
          self_check_enabled: boolean
          timezone: string
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_archive_enabled?: boolean
          auto_memory_enabled?: boolean
          created_at?: string
          default_effort?: string
          locale?: string
          metadata?: Json
          morning_enabled?: boolean
          morning_time?: string
          self_check_enabled?: boolean
          timezone?: string
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_archive_enabled?: boolean
          auto_memory_enabled?: boolean
          created_at?: string
          default_effort?: string
          locale?: string
          metadata?: Json
          morning_enabled?: boolean
          morning_time?: string
          self_check_enabled?: boolean
          timezone?: string
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string | null
          reaction_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          reaction_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          reaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          locale: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          locale?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          locale?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_conversations: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          share_token: string
          view_count: number | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          share_token?: string
          view_count?: number | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          share_token?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_documents: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string | null
          id: string
          metadata: Json | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          summary?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_documents_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_stats: { Args: never; Returns: Json }
      hanchi_search_context_internal: {
        Args: {
          p_limit?: number
          p_project_id?: string
          p_query: string
          p_user_id: string
        }
        Returns: {
          content: string
          event_date: string
          scope: string
          score: number
          source_id: string
          source_type: string
          title: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      match_nigerian_knowledge:
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
