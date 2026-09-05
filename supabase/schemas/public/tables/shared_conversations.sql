CREATE TABLE "public"."shared_conversations" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid,
  "share_token"     text                     NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  "is_public"       boolean                  DEFAULT true,
  "expires_at"      timestamp with time zone,
  "view_count"      integer                  DEFAULT 0,
  "created_by"      uuid,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "shared_conversations_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT "shared_conversations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT "shared_conversations_pkey" PRIMARY KEY (id),
  CONSTRAINT "shared_conversations_share_token_key" UNIQUE (share_token)
);

ALTER TABLE "public"."shared_conversations"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shared_conversations_conversation_id ON public.shared_conversations USING btree (conversation_id);

CREATE INDEX idx_shared_conversations_token ON public.shared_conversations USING btree (share_token);

CREATE POLICY "Users can create shared links for their conversations" ON "public"."shared_conversations"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((created_by = auth.uid()));

CREATE POLICY "Users can delete their own shared links" ON "public"."shared_conversations"
  FOR DELETE
  TO PUBLIC
  USING ((created_by = auth.uid()));

CREATE POLICY "Users can update their own shared links" ON "public"."shared_conversations"
  FOR UPDATE
  TO PUBLIC
  USING ((created_by = auth.uid()));

CREATE POLICY "Users can view their own shared links" ON "public"."shared_conversations"
  FOR SELECT
  TO PUBLIC
  USING (((created_by = auth.uid()) OR (is_public = true)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."shared_conversations" TO "anon", "authenticated", "postgres", "service_role";
