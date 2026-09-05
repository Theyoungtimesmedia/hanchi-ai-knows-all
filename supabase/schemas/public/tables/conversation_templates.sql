CREATE TABLE "public"."conversation_templates" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"           text                     NOT NULL,
  "description"     text,
  "category"        text,
  "system_prompt"   text                     NOT NULL,
  "sample_messages" jsonb,
  "is_public"       boolean                  DEFAULT true,
  "usage_count"     integer                  DEFAULT 0,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "conversation_templates_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."conversation_templates"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates" ON "public"."conversation_templates"
  FOR SELECT
  TO PUBLIC
  USING ((is_public = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversation_templates" TO "anon", "authenticated", "postgres", "service_role";
