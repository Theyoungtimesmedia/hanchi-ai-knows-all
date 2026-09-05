CREATE TABLE "public"."blocked_users" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "reason"     text,
  "blocked_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "blocked_users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."blocked_users"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked users" ON "public"."blocked_users"
  FOR ALL
  TO "authenticated"
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."blocked_users" TO "anon", "authenticated", "postgres", "service_role";
