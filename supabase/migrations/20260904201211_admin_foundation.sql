-- EXULT admin foundation (Task 2).
-- profiles table, get_admin_stats() RPC, admin read policies, is_admin grant.
-- Mirrors supabase/schemas/public/{tables/profiles.sql,functions/get_admin_stats.sql} and the
-- admin SELECT policy additions on conversations/messages/documents/generated_images.
-- Applied to the live project via `supabase db push`.

CREATE TABLE "public"."profiles" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid                     NOT NULL,
  "display_name" text,
  "avatar_url"   text,
  "locale"       text                     DEFAULT 'en'::text,
  "created_at"   timestamp with time zone DEFAULT now(),
  "updated_at"   timestamp with time zone DEFAULT now(),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "profiles_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Users can insert their own profile" ON "public"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Admins can view all profiles" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING (private.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

CREATE OR REPLACE FUNCTION public.get_admin_stats ()
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_users             bigint;
  v_conversations     bigint;
  v_messages          bigint;
  v_documents         bigint;
  v_generated_images  bigint;
  v_admins            bigint;
  v_messages_last_24h bigint;
  v_messages_last_7d  bigint;
  v_new_users_last_7d bigint;
BEGIN
  IF NOT private.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT count(*) INTO v_users FROM auth.users;
  SELECT count(*) INTO v_conversations FROM public.conversations;
  SELECT count(*) INTO v_messages FROM public.messages;
  SELECT count(*) INTO v_documents FROM public.documents;
  SELECT count(*) INTO v_generated_images FROM public.generated_images;
  SELECT count(*) INTO v_admins FROM public.admin_users;
  SELECT count(*) INTO v_messages_last_24h FROM public.messages WHERE created_at >= now() - interval '24 hours';
  SELECT count(*) INTO v_messages_last_7d FROM public.messages WHERE created_at >= now() - interval '7 days';
  SELECT count(*) INTO v_new_users_last_7d FROM auth.users WHERE created_at >= now() - interval '7 days';

  RETURN jsonb_build_object(
    'users', v_users,
    'conversations', v_conversations,
    'messages', v_messages,
    'documents', v_documents,
    'generated_images', v_generated_images,
    'admins', v_admins,
    'messages_last_24h', v_messages_last_24h,
    'messages_last_7d', v_messages_last_7d,
    'new_users_last_7d', v_new_users_last_7d
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."get_admin_stats"() TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."get_admin_stats"() FROM PUBLIC;

CREATE POLICY "Admins can view all conversations" ON "public"."conversations"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

CREATE POLICY "Admins can view all messages" ON "public"."messages"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

CREATE POLICY "Admins can view all documents" ON "public"."documents"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

CREATE POLICY "Admins can view all images" ON "public"."generated_images"
  FOR SELECT
  TO "authenticated"
  USING ((private.is_admin(auth.uid()) = true));

GRANT EXECUTE ON FUNCTION "public"."is_admin"(uuid) TO "authenticated", "postgres";

REVOKE ALL ON FUNCTION "public"."is_admin"(uuid) FROM PUBLIC;