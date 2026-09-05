CREATE OR REPLACE FUNCTION public.update_knowledge_search_vector()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
  NEW.content_search =
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'C');
  RETURN NEW;
END;
$function$;

GRANT EXECUTE ON FUNCTION "public"."update_knowledge_search_vector"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."update_knowledge_search_vector"() FROM PUBLIC;
