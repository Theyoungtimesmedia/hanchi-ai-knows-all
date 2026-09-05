CREATE TABLE "public"."user_memory" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                uuid                     NOT NULL,
  "memory_key"             text                     NOT NULL,
  "memory_value"           text                     NOT NULL,
  "category"               text                     DEFAULT 'general'::text,
  "confidence_score"       double precision         DEFAULT 1.0,
  "source_conversation_id" uuid,
  "created_at"             timestamp with time zone DEFAULT now(),
  "updated_at"             timestamp with time zone DEFAULT now(),
  CONSTRAINT "user_memory_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_memory_source_conversation_id_fkey" FOREIGN KEY (source_conversation_id) REFERENCES public.conversations(id) ON DELETE SET NULL,
  CONSTRAINT "user_memory_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."user_memory"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_memory_category ON public.user_memory USING btree (category);

CREATE INDEX idx_user_memory_user_id ON public.user_memory USING btree (user_id);

CREATE TRIGGER trigger_update_user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_memory_updated_at();

CREATE POLICY "Users can delete their own memory" ON "public"."user_memory"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own memory" ON "public"."user_memory"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own memory" ON "public"."user_memory"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own memory" ON "public"."user_memory"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_memory" TO "anon", "authenticated", "postgres", "service_role";
