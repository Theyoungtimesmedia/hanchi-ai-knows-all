CREATE TABLE "public"."user_preferences" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "preferred_language"    text                     DEFAULT 'en'::text,
  "voice_enabled"         boolean                  DEFAULT true,
  "study_mode"            boolean                  DEFAULT false,
  "learning_goals"        text[],
  "notification_settings" jsonb                    DEFAULT '{"push": false, "email": false}'::jsonb,
  "created_at"            timestamp with time zone DEFAULT now(),
  "updated_at"            timestamp with time zone DEFAULT now(),
  CONSTRAINT "user_preferences_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "user_preferences_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."user_preferences"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences_updated_at();

CREATE POLICY "Users can insert their own preferences" ON "public"."user_preferences"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own preferences" ON "public"."user_preferences"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own preferences" ON "public"."user_preferences"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_preferences" TO "anon", "authenticated", "postgres", "service_role";
