CREATE TABLE "public"."nigerian_knowledge" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "content"        text                     NOT NULL,
  "embedding"      extensions.vector(768),
  "category"       text                     NOT NULL,
  "language"       text                     DEFAULT 'en'::text,
  "subcategory"    text,
  "metadata"       jsonb,
  "usage_count"    integer                  DEFAULT 0,
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  "content_search" tsvector,
  CONSTRAINT "nigerian_knowledge_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."nigerian_knowledge"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_nigerian_knowledge_category ON public.nigerian_knowledge USING btree (category);

CREATE INDEX idx_nigerian_knowledge_language ON public.nigerian_knowledge USING btree (LANGUAGE);

CREATE INDEX nigerian_knowledge_embedding_idx ON public.nigerian_knowledge USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists='100');

CREATE INDEX nigerian_knowledge_search_idx ON public.nigerian_knowledge USING gin (content_search);

CREATE TRIGGER update_knowledge_search
  BEFORE INSERT OR UPDATE ON public.nigerian_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_search_vector();

CREATE TRIGGER update_nigerian_knowledge_updated_at
  BEFORE UPDATE ON public.nigerian_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Anyone can read nigerian knowledge" ON "public"."nigerian_knowledge"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."nigerian_knowledge" TO "anon", "authenticated", "postgres", "service_role";
