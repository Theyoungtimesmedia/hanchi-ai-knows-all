CREATE TABLE "public"."app_settings" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "key"        text                     NOT NULL,
  "value"      jsonb                    DEFAULT '{}'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "app_settings_key_key" UNIQUE (key),
  CONSTRAINT "app_settings_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."app_settings"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app settings" ON "public"."app_settings"
  FOR ALL
  TO "authenticated"
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

CREATE POLICY "Anyone can read app settings" ON "public"."app_settings"
  FOR SELECT
  TO "authenticated"
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."app_settings" TO "anon", "authenticated", "postgres", "service_role";
