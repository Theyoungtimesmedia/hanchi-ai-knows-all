CREATE TABLE "public"."collection_items" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "collection_id" uuid                     NOT NULL,
  "item_type"     text                     NOT NULL,
  "item_id"       text                     NOT NULL,
  "item_content"  text,
  "item_metadata" jsonb,
  "created_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "collection_items_item_type_check" CHECK ((item_type = ANY (ARRAY['message'::text, 'image'::text, 'prompt'::text]))),
  CONSTRAINT "collection_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE
);

ALTER TABLE "public"."collection_items"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add to their collections" ON "public"."collection_items"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_items.collection_id) AND (collections.user_id = auth.uid())))));

CREATE POLICY "Users can remove from their collections" ON "public"."collection_items"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_items.collection_id) AND (collections.user_id = auth.uid())))));

CREATE POLICY "Users can view their collection items" ON "public"."collection_items"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.collections
  WHERE ((collections.id = collection_items.collection_id) AND (collections.user_id = auth.uid())))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."collection_items" TO "anon", "authenticated", "postgres", "service_role";
