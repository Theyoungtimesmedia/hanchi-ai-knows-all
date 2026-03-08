
-- Collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections" ON public.collections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own collections" ON public.collections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON public.collections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON public.collections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Collection items table
CREATE TABLE public.collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('message', 'image', 'prompt')),
  item_id TEXT NOT NULL,
  item_content TEXT,
  item_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their collection items" ON public.collection_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);
CREATE POLICY "Users can add to their collections" ON public.collection_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);
CREATE POLICY "Users can remove from their collections" ON public.collection_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);

-- Add pinned column to conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
