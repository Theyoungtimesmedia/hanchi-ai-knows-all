CREATE TABLE public.brain_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layer text NOT NULL DEFAULT 'high_signal' CHECK (layer IN ('high_signal', 'context_rot')),
  record_type text NOT NULL DEFAULT 'fact' CHECK (record_type IN ('fact', 'inference', 'decision', 'event', 'source_chunk')),
  title text NOT NULL,
  content text NOT NULL,
  domain text,
  project text,
  person text,
  company text,
  status text NOT NULL DEFAULT 'current',
  source_name text,
  source_type text,
  provenance text,
  event_date date,
  captured_at timestamptz NOT NULL DEFAULT now(),
  confidence_score double precision NOT NULL DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  superseded_by uuid REFERENCES public.brain_records(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_records TO authenticated;
GRANT ALL ON public.brain_records TO service_role;

ALTER TABLE public.brain_records ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_brain_records_user_layer ON public.brain_records(user_id, layer);
CREATE INDEX idx_brain_records_user_event_date ON public.brain_records(user_id, event_date);
CREATE INDEX idx_brain_records_user_search ON public.brain_records USING gin (to_tsvector('english', title || ' ' || content));

CREATE TRIGGER trigger_update_brain_records_updated_at
  BEFORE UPDATE ON public.brain_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Users can view their own brain records" ON public.brain_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own brain records" ON public.brain_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brain records" ON public.brain_records
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brain records" ON public.brain_records
  FOR DELETE TO authenticated USING (auth.uid() = user_id);