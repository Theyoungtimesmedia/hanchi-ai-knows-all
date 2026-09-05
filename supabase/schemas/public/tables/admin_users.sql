CREATE TABLE "public"."admin_users" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "admin_users_pkey" PRIMARY KEY (id),
  CONSTRAINT "admin_users_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."admin_users"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check own admin status" ON "public"."admin_users"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."admin_users" TO "anon", "authenticated", "postgres", "service_role";
