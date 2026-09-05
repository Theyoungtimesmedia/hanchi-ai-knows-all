CREATE TABLE "public"."collections" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "name"        text                     NOT NULL,
  "description" text,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "collections_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."collections"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own collections" ON "public"."collections"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own collections" ON "public"."collections"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own collections" ON "public"."collections"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own collections" ON "public"."collections"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collections" TO "anon", "authenticated", "postgres", "service_role";
