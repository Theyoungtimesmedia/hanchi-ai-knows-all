CREATE TABLE "public"."message_reactions" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "message_id"    uuid,
  "user_id"       uuid,
  "reaction_type" text                     NOT NULL,
  "created_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "message_reactions_message_id_user_id_reaction_type_key" UNIQUE (message_id, user_id, reaction_type),
  CONSTRAINT "message_reactions_pkey" PRIMARY KEY (id),
  CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE
);

ALTER TABLE "public"."message_reactions"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_message_reactions_message_id ON public.message_reactions USING btree (message_id);

CREATE POLICY "Users can create reactions" ON "public"."message_reactions"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can delete their own reactions" ON "public"."message_reactions"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can view reactions" ON "public"."message_reactions"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."message_reactions" TO "anon", "authenticated", "postgres", "service_role";
