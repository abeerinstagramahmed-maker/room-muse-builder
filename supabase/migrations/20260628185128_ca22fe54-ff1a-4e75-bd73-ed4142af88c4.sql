CREATE TABLE public.shared_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  scene_data jsonb NOT NULL,
  title text,
  description text,
  room_type text,
  remix_count integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  share_token text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_designs TO authenticated;
GRANT SELECT ON public.shared_designs TO anon;
GRANT ALL ON public.shared_designs TO service_role;

ALTER TABLE public.shared_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public designs are viewable by everyone"
  ON public.shared_designs FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.shared_designs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.shared_designs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.shared_designs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.design_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  design_id uuid REFERENCES public.shared_designs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, design_id)
);

GRANT SELECT, INSERT, DELETE ON public.design_likes TO authenticated;
GRANT SELECT ON public.design_likes TO anon;
GRANT ALL ON public.design_likes TO service_role;

ALTER TABLE public.design_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON public.design_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like as themselves"
  ON public.design_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.design_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_remix_count(p_design_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.shared_designs
  SET remix_count = remix_count + 1
  WHERE id = p_design_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_remix_count(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_remix_count(uuid) TO authenticated;