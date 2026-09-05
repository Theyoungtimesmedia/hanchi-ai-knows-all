CREATE OR REPLACE FUNCTION public.match_nigerian_knowledge (
  query_embedding extensions.vector,
  match_threshold double precision  DEFAULT 0.7,
  match_count     integer           DEFAULT 5,
  filter_language text              DEFAULT NULL::text
)
  RETURNS TABLE (
    id          uuid,
    content     text,
    category    text,
    language    text,
    subcategory text,
    metadata    jsonb,
    similarity  double precision
  )
  LANGUAGE sql
  SET search_path TO 'public'
  AS $function$
  SELECT nk.id, nk.content, nk.category, nk.language, nk.subcategory, nk.metadata,
    1 - (nk.embedding <=> query_embedding)
  FROM public.nigerian_knowledge nk
  WHERE (filter_language IS NULL OR nk.language = filter_language)
    AND 1 - (nk.embedding <=> query_embedding) > match_threshold
  ORDER BY nk.embedding <=> query_embedding
  LIMIT match_count
$function$;

CREATE OR REPLACE FUNCTION public.match_nigerian_knowledge (
  search_query    text,
  match_count     integer DEFAULT 5,
  filter_language text    DEFAULT NULL::text
)
  RETURNS TABLE (
    id          uuid,
    content     text,
    category    text,
    language    text,
    subcategory text,
    metadata    jsonb,
    similarity  real
  )
  LANGUAGE sql
  SET search_path TO 'public'
  AS $function$
  SELECT nk.id, nk.content, nk.category, nk.language, nk.subcategory, nk.metadata,
    ts_rank(nk.content_search, plainto_tsquery('english', search_query))::real
  FROM public.nigerian_knowledge nk
  WHERE nk.content_search @@ plainto_tsquery('english', search_query)
    AND (filter_language IS NULL OR nk.language = filter_language)
  ORDER BY 7 DESC
  LIMIT match_count
$function$;

GRANT EXECUTE ON FUNCTION "public"."match_nigerian_knowledge"(extensions.vector, double precision, integer, text) TO "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."match_nigerian_knowledge"(text, integer, text) TO "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."match_nigerian_knowledge"(extensions.vector, double precision, integer, text) FROM PUBLIC;

REVOKE ALL ON FUNCTION "public"."match_nigerian_knowledge"(text, integer, text) FROM PUBLIC;
