CREATE TABLE "public"."documents" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "conversation_id" uuid,
  "title"           text                     NOT NULL,
  "file_type"       text                     NOT NULL,
  "file_size"       integer,
  "summary"         text,
  "extracted_text"  text,
  "metadata"        jsonb,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "documents_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT "documents_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."documents"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own documents" ON "public"."documents"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own documents" ON "public"."documents"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own documents" ON "public"."documents"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Admins can view all documents" ON "public"."documents"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."documents" TO "anon", "authenticated", "postgres", "service_role";
