CREATE TABLE "public"."announcements" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"      text                     NOT NULL,
  "content"    text                     NOT NULL,
  "is_active"  boolean                  DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  CONSTRAINT "announcements_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."announcements"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements" ON "public"."announcements"
  FOR ALL
  TO "authenticated"
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active announcements" ON "public"."announcements"
  FOR SELECT
  TO "authenticated"
  USING ((is_active = true));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."announcements" TO "anon", "authenticated", "postgres", "service_role";
