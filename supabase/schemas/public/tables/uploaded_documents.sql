CREATE TABLE "public"."uploaded_documents" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid,
  "conversation_id" uuid,
  "file_name"       text                     NOT NULL,
  "file_type"       text                     NOT NULL,
  "file_size"       integer                  NOT NULL,
  "file_url"        text,
  "extracted_text"  text,
  "summary"         text,
  "metadata"        jsonb,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "uploaded_documents_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT "uploaded_documents_pkey" PRIMARY KEY (id),
  CONSTRAINT "uploaded_documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

ALTER TABLE "public"."uploaded_documents"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_uploaded_documents_conversation_id ON public.uploaded_documents USING btree (conversation_id);

CREATE INDEX idx_uploaded_documents_user_id ON public.uploaded_documents USING btree (user_id);

CREATE POLICY "Users can delete their own documents" ON "public"."uploaded_documents"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can upload documents" ON "public"."uploaded_documents"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can view their own documents" ON "public"."uploaded_documents"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."uploaded_documents" TO "anon", "authenticated", "postgres", "service_role";
