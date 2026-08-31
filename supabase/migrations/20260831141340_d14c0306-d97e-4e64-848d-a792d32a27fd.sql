CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_knowledge_search_vector() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.content_search =
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_user_memory_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_user_preferences_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);
CREATE TABLE public.app_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.blocked_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reason text,
    blocked_by uuid,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.collection_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id uuid NOT NULL,
    item_type text NOT NULL,
    item_id text NOT NULL,
    item_content text,
    item_metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT collection_items_item_type_check CHECK ((item_type = ANY (ARRAY['message'::text, 'image'::text, 'prompt'::text])))
);
CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.conversation_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    system_prompt text NOT NULL,
    sample_messages jsonb,
    is_public boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.conversations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    language text DEFAULT 'en'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    pinned boolean DEFAULT false
);
CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    conversation_id uuid,
    title text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    summary text,
    extracted_text text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.flagged_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reason text,
    flagged_by uuid,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.generated_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    conversation_id uuid,
    prompt text NOT NULL,
    image_url text,
    image_base64 text,
    style text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.message_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid,
    user_id uuid,
    reaction_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.message_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    source_title text NOT NULL,
    source_url text,
    source_snippet text,
    source_timestamp timestamp with time zone,
    relevance_score double precision DEFAULT 0.0,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])))
);
ALTER TABLE ONLY public.messages REPLICA IDENTITY FULL;
CREATE TABLE public.nigerian_knowledge (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    embedding public.vector(768),
    category text NOT NULL,
    language text DEFAULT 'en'::text,
    subcategory text,
    metadata jsonb,
    usage_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    content_search tsvector
);
CREATE TABLE public.shared_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    share_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) NOT NULL,
    is_public boolean DEFAULT true,
    expires_at timestamp with time zone,
    view_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.uploaded_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    conversation_id uuid,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    file_url text,
    extracted_text text,
    summary text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.user_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    memory_key text NOT NULL,
    memory_value text NOT NULL,
    category text DEFAULT 'general'::text,
    confidence_score double precision DEFAULT 1.0,
    source_conversation_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.user_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    preferred_language text DEFAULT 'en'::text,
    voice_enabled boolean DEFAULT true,
    study_mode boolean DEFAULT false,
    learning_goals text[],
    notification_settings jsonb DEFAULT '{"push": false, "email": false}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE FUNCTION public.match_nigerian_knowledge(search_query text, match_count integer DEFAULT 5, filter_language text DEFAULT NULL::text) RETURNS TABLE(id uuid, content text, category text, language text, subcategory text, metadata jsonb, similarity real)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    nk.id,
    nk.content,
    nk.category,
    nk.language,
    nk.subcategory,
    nk.metadata,
    ts_rank(nk.content_search, plainto_tsquery('english', search_query))::REAL as similarity
  FROM nigerian_knowledge nk
  WHERE
    nk.content_search @@ plainto_tsquery('english', search_query)
    AND (filter_language IS NULL OR nk.language = filter_language)
  ORDER BY similarity DESC
  LIMIT match_count;
  UPDATE nigerian_knowledge
  SET usage_count = usage_count + 1
  WHERE id IN (
    SELECT nk.id
    FROM nigerian_knowledge nk
    WHERE
      nk.content_search @@ plainto_tsquery('english', search_query)
      AND (filter_language IS NULL OR nk.language = filter_language)
    ORDER BY ts_rank(nk.content_search, plainto_tsquery('english', search_query)) DESC
    LIMIT match_count
  );
END;
$$;

CREATE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id)
$$;

CREATE FUNCTION public.unused_placeholder_removed(search_query text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN;
END;
$$;

DROP FUNCTION public.unused_placeholder_removed(text);

CREATE FUNCTION public.match_nigerian_knowledge(query_embedding public.vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 5, filter_language text DEFAULT NULL::text) RETURNS TABLE(id uuid, content text, category text, language text, subcategory text, metadata jsonb, similarity double precision)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    nk.id,
    nk.content,
    nk.category,
    nk.language,
    nk.subcategory,
    nk.metadata,
    1 - (nk.embedding <=> query_embedding) AS similarity
  FROM nigerian_knowledge nk
  WHERE
    (filter_language IS NULL OR nk.language = filter_language)
    AND 1 - (nk.embedding <=> query_embedding) > match_threshold
  ORDER BY nk.embedding <=> query_embedding
  LIMIT match_count;
  UPDATE nigerian_knowledge
  SET usage_count = usage_count + 1
  WHERE id IN (
    SELECT nk.id
    FROM nigerian_knowledge nk
    WHERE
      (filter_language IS NULL OR nk.language = filter_language)
      AND 1 - (nk.embedding <=> query_embedding) > match_threshold
    ORDER BY nk.embedding <=> query_embedding
    LIMIT match_count
  );
END;
$$;

ALTER TABLE ONLY public.admin_users ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.announcements ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.app_settings ADD CONSTRAINT app_settings_key_key UNIQUE (key);
ALTER TABLE ONLY public.app_settings ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.blocked_users ADD CONSTRAINT blocked_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.collection_items ADD CONSTRAINT collection_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.collections ADD CONSTRAINT collections_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.conversation_templates ADD CONSTRAINT conversation_templates_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.documents ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.flagged_users ADD CONSTRAINT flagged_users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.generated_images ADD CONSTRAINT generated_images_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.message_reactions ADD CONSTRAINT message_reactions_message_id_user_id_reaction_type_key UNIQUE (message_id, user_id, reaction_type);
ALTER TABLE ONLY public.message_reactions ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.message_sources ADD CONSTRAINT message_sources_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.nigerian_knowledge ADD CONSTRAINT nigerian_knowledge_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.shared_conversations ADD CONSTRAINT shared_conversations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.shared_conversations ADD CONSTRAINT shared_conversations_share_token_key UNIQUE (share_token);
ALTER TABLE ONLY public.uploaded_documents ADD CONSTRAINT uploaded_documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_memory ADD CONSTRAINT user_memory_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_preferences ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

CREATE INDEX idx_conversations_updated_at ON public.conversations USING btree (updated_at DESC);
CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);
CREATE INDEX idx_generated_images_conversation_id ON public.generated_images USING btree (conversation_id);
CREATE INDEX idx_generated_images_user_id ON public.generated_images USING btree (user_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions USING btree (message_id);
CREATE INDEX idx_message_sources_message_id ON public.message_sources USING btree (message_id);
CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);
CREATE INDEX idx_nigerian_knowledge_category ON public.nigerian_knowledge USING btree (category);
CREATE INDEX idx_nigerian_knowledge_language ON public.nigerian_knowledge USING btree (language);
CREATE INDEX idx_shared_conversations_conversation_id ON public.shared_conversations USING btree (conversation_id);
CREATE INDEX idx_shared_conversations_token ON public.shared_conversations USING btree (share_token);
CREATE INDEX idx_uploaded_documents_conversation_id ON public.uploaded_documents USING btree (conversation_id);
CREATE INDEX idx_uploaded_documents_user_id ON public.uploaded_documents USING btree (user_id);
CREATE INDEX idx_user_memory_category ON public.user_memory USING btree (category);
CREATE INDEX idx_user_memory_user_id ON public.user_memory USING btree (user_id);
CREATE INDEX nigerian_knowledge_embedding_idx ON public.nigerian_knowledge USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');
CREATE INDEX nigerian_knowledge_search_idx ON public.nigerian_knowledge USING gin (content_search);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_user_memory_updated_at BEFORE UPDATE ON public.user_memory FOR EACH ROW EXECUTE FUNCTION public.update_user_memory_updated_at();
CREATE TRIGGER trigger_update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_user_preferences_updated_at();
CREATE TRIGGER update_knowledge_search BEFORE INSERT OR UPDATE ON public.nigerian_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_search_vector();
CREATE TRIGGER update_nigerian_knowledge_updated_at BEFORE UPDATE ON public.nigerian_knowledge FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE ONLY public.collection_items ADD CONSTRAINT collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.documents ADD CONSTRAINT documents_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.generated_images ADD CONSTRAINT generated_images_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
ALTER TABLE ONLY public.generated_images ADD CONSTRAINT generated_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE ONLY public.message_reactions ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.message_reactions ADD CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE ONLY public.message_sources ADD CONSTRAINT message_sources_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.shared_conversations ADD CONSTRAINT shared_conversations_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.shared_conversations ADD CONSTRAINT shared_conversations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE ONLY public.uploaded_documents ADD CONSTRAINT uploaded_documents_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
ALTER TABLE ONLY public.uploaded_documents ADD CONSTRAINT uploaded_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE ONLY public.user_memory ADD CONSTRAINT user_memory_source_conversation_id_fkey FOREIGN KEY (source_conversation_id) REFERENCES public.conversations(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.user_memory ADD CONSTRAINT user_memory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_preferences ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nigerian_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements" ON public.announcements TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage app settings" ON public.app_settings TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage blocked users" ON public.blocked_users TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage flagged users" ON public.flagged_users TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read nigerian knowledge" ON public.nigerian_knowledge FOR SELECT USING (true);
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT TO authenticated USING ((is_active = true));
CREATE POLICY "Anyone can view public templates" ON public.conversation_templates FOR SELECT USING ((is_public = true));
CREATE POLICY "System can insert sources" ON public.message_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can add to their collections" ON public.collection_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_items.collection_id) AND (collections.user_id = auth.uid())))));
CREATE POLICY "Users can check own admin status" ON public.admin_users FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY "Users can create images" ON public.generated_images FOR INSERT WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Users can create messages in their conversations" ON public.messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));
CREATE POLICY "Users can create reactions" ON public.message_reactions FOR INSERT WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Users can create shared links for their conversations" ON public.shared_conversations FOR INSERT WITH CHECK ((created_by = auth.uid()));
CREATE POLICY "Users can create their own collections" ON public.collections FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can create their own conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can delete messages in their conversations" ON public.messages FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));
CREATE POLICY "Users can delete their own collections" ON public.collections FOR DELETE TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own documents" ON public.uploaded_documents FOR DELETE USING ((user_id = auth.uid()));
CREATE POLICY "Users can delete their own images" ON public.generated_images FOR DELETE USING ((user_id = auth.uid()));
CREATE POLICY "Users can delete their own memory" ON public.user_memory FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own reactions" ON public.message_reactions FOR DELETE USING ((user_id = auth.uid()));
CREATE POLICY "Users can delete their own shared links" ON public.shared_conversations FOR DELETE USING ((created_by = auth.uid()));
CREATE POLICY "Users can insert their own memory" ON public.user_memory FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can remove from their collections" ON public.collection_items FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_items.collection_id) AND (collections.user_id = auth.uid())))));
CREATE POLICY "Users can update their own collections" ON public.collections FOR UPDATE TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own memory" ON public.user_memory FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their own shared links" ON public.shared_conversations FOR UPDATE USING ((created_by = auth.uid()));
CREATE POLICY "Users can upload documents" ON public.uploaded_documents FOR INSERT WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));
CREATE POLICY "Users can view reactions" ON public.message_reactions FOR SELECT USING (true);
CREATE POLICY "Users can view sources for their messages" ON public.message_sources FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.messages m
     JOIN public.conversations c ON ((c.id = m.conversation_id)))
  WHERE ((m.id = message_sources.message_id) AND (c.user_id = auth.uid())))));
CREATE POLICY "Users can view their collection items" ON public.collection_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_items.collection_id) AND (collections.user_id = auth.uid())))));
CREATE POLICY "Users can view their own collections" ON public.collections FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own documents" ON public.uploaded_documents FOR SELECT USING ((user_id = auth.uid()));
CREATE POLICY "Users can view their own images" ON public.generated_images FOR SELECT USING ((user_id = auth.uid()));
CREATE POLICY "Users can view their own memory" ON public.user_memory FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own shared links" ON public.shared_conversations FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.messages;