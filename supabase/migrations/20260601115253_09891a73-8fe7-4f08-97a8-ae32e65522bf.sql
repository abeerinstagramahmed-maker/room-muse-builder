-- Add 3D fields to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS model_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS width numeric,
  ADD COLUMN IF NOT EXISTS depth numeric,
  ADD COLUMN IF NOT EXISTS height numeric;

-- saved_scenes table
CREATE TABLE public.saved_scenes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Scene',
  scene_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_scenes TO authenticated;
GRANT ALL ON public.saved_scenes TO service_role;

ALTER TABLE public.saved_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scenes"
ON public.saved_scenes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scenes"
ON public.saved_scenes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own scenes"
ON public.saved_scenes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes"
ON public.saved_scenes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes"
ON public.saved_scenes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_scenes_updated_at
BEFORE UPDATE ON public.saved_scenes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('models-3d', 'models-3d', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-thumbnails', 'product-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "3D models are publicly readable"
ON storage.objects FOR SELECT USING (bucket_id = 'models-3d');
CREATE POLICY "Admins can upload 3D models"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'models-3d' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update 3D models"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'models-3d' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete 3D models"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'models-3d' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Product thumbnails are publicly readable"
ON storage.objects FOR SELECT USING (bucket_id = 'product-thumbnails');
CREATE POLICY "Admins can upload product thumbnails"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update product thumbnails"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete product thumbnails"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));