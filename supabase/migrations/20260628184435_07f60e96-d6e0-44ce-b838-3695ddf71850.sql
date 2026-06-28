CREATE TABLE public.room_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  room_type text,
  estimated_width numeric,
  estimated_depth numeric,
  estimated_height numeric,
  wall_color text,
  floor_type text,
  detected_furniture jsonb NOT NULL DEFAULT '[]'::jsonb,
  style_suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  lighting_conditions text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_analyses TO authenticated;
GRANT ALL ON public.room_analyses TO service_role;

ALTER TABLE public.room_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own room analyses"
  ON public.room_analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own room analyses"
  ON public.room_analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own room analyses"
  ON public.room_analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);