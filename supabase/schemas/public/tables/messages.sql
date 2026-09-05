CREATE TABLE "public"."messages" (
  "id"              uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "conversation_id" uuid                     NOT NULL,
  "role"            text                     NOT NULL,
  "content"         text                     NOT NULL,
  "metadata"        jsonb,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT "messages_pkey" PRIMARY KEY (id),
  CONSTRAINT "messages_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])))
);

ALTER TABLE "public"."messages"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."messages"
  REPLICA IDENTITY FULL;

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);

CREATE POLICY "Users can create messages in their conversations" ON "public"."messages"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));

CREATE POLICY "Users can delete messages in their conversations" ON "public"."messages"
  FOR DELETE
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));

CREATE POLICY "Users can view messages in their conversations" ON "public"."messages"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND (conversations.user_id = auth.uid())))));

CREATE POLICY "Admins can view all messages" ON "public"."messages"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "anon", "authenticated", "postgres", "service_role";
