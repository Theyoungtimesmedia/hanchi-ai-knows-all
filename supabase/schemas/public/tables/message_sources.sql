CREATE TABLE "public"."message_sources" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "message_id"       uuid                     NOT NULL,
  "source_title"     text                     NOT NULL,
  "source_url"       text,
  "source_snippet"   text,
  "source_timestamp" timestamp with time zone,
  "relevance_score"  double precision         DEFAULT 0.0,
  "created_at"       timestamp with time zone DEFAULT now(),
  CONSTRAINT "message_sources_pkey" PRIMARY KEY (id),
  CONSTRAINT "message_sources_message_id_fkey" FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE
);

ALTER TABLE "public"."message_sources"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_message_sources_message_id ON public.message_sources USING btree (message_id);

CREATE POLICY "System can insert sources" ON "public"."message_sources"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Users can view sources for their messages" ON "public"."message_sources"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM (public.messages m
     JOIN public.conversations c ON ((c.id = m.conversation_id)))
  WHERE ((m.id = message_sources.message_id) AND (c.user_id = auth.uid())))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."message_sources" TO "anon", "authenticated", "postgres", "service_role";
