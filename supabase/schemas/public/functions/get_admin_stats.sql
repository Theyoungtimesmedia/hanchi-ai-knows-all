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