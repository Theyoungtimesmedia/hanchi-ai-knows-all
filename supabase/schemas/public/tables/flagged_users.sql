CREATE TABLE "public"."flagged_users" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "reason"     text,
  "flagged_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "flagged_users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."flagged_users"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flagged users" ON "public"."flagged_users"
  FOR ALL
  TO "authenticated"
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."flagged_users" TO "anon", "authenticated", "postgres", "service_role";
