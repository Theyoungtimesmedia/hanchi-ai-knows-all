CREATE TABLE "public"."conversations" (
  "id"         uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"    uuid                     NOT NULL,
  "title"      text                     NOT NULL,
  "language"   text                     DEFAULT 'en'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "pinned"     boolean                  DEFAULT false,
  CONSTRAINT "conversations_pkey" PRIMARY KEY (id),
  CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."conversations"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_conversations_updated_at ON public.conversations USING btree (updated_at DESC);

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Users can create their own conversations" ON "public"."conversations"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own conversations" ON "public"."conversations"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own conversations" ON "public"."conversations"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own conversations" ON "public"."conversations"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Admins can view all conversations" ON "public"."conversations"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversations" TO "anon", "authenticated", "postgres", "service_role";
