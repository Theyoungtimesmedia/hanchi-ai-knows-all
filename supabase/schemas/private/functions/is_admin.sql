CREATE OR REPLACE FUNCTION private.is_admin (
  _user_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id)
$function$;

GRANT EXECUTE ON FUNCTION "private"."is_admin"(uuid) TO "authenticated", "postgres";

REVOKE ALL ON FUNCTION "private"."is_admin"(uuid) FROM PUBLIC;
