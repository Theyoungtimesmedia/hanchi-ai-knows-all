-- Fix search path for match_nigerian_knowledge function
CREATE OR REPLACE FUNCTION match_nigerian_knowledge(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_language TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  category TEXT,
  language TEXT,
  subcategory TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nk.id,
    nk.content,
    nk.category,
    nk.language,
    nk.subcategory,
    nk.metadata,
    1 - (nk.embedding <=> query_embedding) AS similarity
  FROM nigerian_knowledge nk
  WHERE 
    (filter_language IS NULL OR nk.language = filter_language)
    AND 1 - (nk.embedding <=> query_embedding) > match_threshold
  ORDER BY nk.embedding <=> query_embedding
  LIMIT match_count;
  
  -- Update usage count for matched entries
  UPDATE nigerian_knowledge
  SET usage_count = usage_count + 1
  WHERE id IN (
    SELECT nk.id
    FROM nigerian_knowledge nk
    WHERE 
      (filter_language IS NULL OR nk.language = filter_language)
      AND 1 - (nk.embedding <=> query_embedding) > match_threshold
    ORDER BY nk.embedding <=> query_embedding
    LIMIT match_count
  );
END;
$$;