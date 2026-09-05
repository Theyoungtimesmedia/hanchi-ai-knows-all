CREATE TABLE "public"."generated_images" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid,
  "conversation_id" uuid,
  "prompt"          text                     NOT NULL,
  "image_url"       text,
  "image_base64"    text,
  "style"           text,
  "metadata"        jsonb,
  "created_at"      timestamp with time zone DEFAULT now(),
  CONSTRAINT "generated_images_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT "generated_images_pkey" PRIMARY KEY (id),
  CONSTRAINT "generated_images_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

ALTER TABLE "public"."generated_images"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_generated_images_conversation_id ON public.generated_images USING btree (conversation_id);

CREATE INDEX idx_generated_images_user_id ON public.generated_images USING btree (user_id);

CREATE POLICY "Users can create images" ON "public"."generated_images"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can delete their own images" ON "public"."generated_images"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can view their own images" ON "public"."generated_images"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = auth.uid()));

CREATE POLICY "Admins can view all images" ON "public"."generated_images"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."generated_images" TO "anon", "authenticated", "postgres", "service_role";
