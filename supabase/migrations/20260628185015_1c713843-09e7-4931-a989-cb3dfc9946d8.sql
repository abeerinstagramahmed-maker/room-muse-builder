CREATE TABLE public.showrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  room_type text NOT NULL,
  thumbnail_url text,
  scene_data jsonb NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.showrooms TO anon, authenticated;
GRANT ALL ON public.showrooms TO service_role;

ALTER TABLE public.showrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Showrooms are publicly readable"
  ON public.showrooms FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert showrooms"
  ON public.showrooms FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update showrooms"
  ON public.showrooms FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete showrooms"
  ON public.showrooms FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.showrooms (name, description, room_type, is_featured, sort_order, scene_data) VALUES
('Modern Minimalist Living', 'Clean lines, neutral palette and an airy open feel.', 'living room', true, 1,
 '{"version":1,"room":{"width":16,"depth":20,"height":9},"wallColors":{"north":"#F2F0EB","south":"#F2F0EB","east":"#F2F0EB","west":"#F2F0EB"},"flooringId":"light-oak","furniture":[{"productId":null,"name":"Sofa","modelUrl":null,"size":[7,2.5,3],"position":[0,0,-6],"rotationY":0,"scale":1},{"productId":null,"name":"Coffee Table","modelUrl":null,"size":[4,1.3,2],"position":[0,0,-1],"rotationY":0,"scale":1},{"productId":null,"name":"TV Stand","modelUrl":null,"size":[5,1.8,1.5],"position":[0,0,8],"rotationY":0,"scale":1}]}'::jsonb),
('Scandinavian Cozy', 'Warm woods, soft textiles and hygge comfort.', 'living room', true, 2,
 '{"version":1,"room":{"width":15,"depth":18,"height":9},"wallColors":{"north":"#EDE7DD","south":"#EDE7DD","east":"#EDE7DD","west":"#EDE7DD"},"flooringId":"light-oak","furniture":[{"productId":null,"name":"Sofa","modelUrl":null,"size":[6.5,2.5,3],"position":[-2,0,-5],"rotationY":0,"scale":1},{"productId":null,"name":"Armchair","modelUrl":null,"size":[3,2.6,3],"position":[4,0,-3],"rotationY":-0.6,"scale":1},{"productId":null,"name":"Coffee Table","modelUrl":null,"size":[3.5,1.3,2],"position":[0,0,0],"rotationY":0,"scale":1}]}'::jsonb),
('Industrial Loft', 'Exposed tones, metal accents and bold contrast.', 'living room', false, 3,
 '{"version":1,"room":{"width":18,"depth":22,"height":10},"wallColors":{"north":"#3C3A38","south":"#D9D6D1","east":"#D9D6D1","west":"#D9D6D1"},"flooringId":"dark-walnut","furniture":[{"productId":null,"name":"Leather Sofa","modelUrl":null,"size":[8,2.6,3.2],"position":[0,0,-7],"rotationY":0,"scale":1},{"productId":null,"name":"Coffee Table","modelUrl":null,"size":[4.5,1.4,2.2],"position":[0,0,-1],"rotationY":0,"scale":1}]}'::jsonb),
('Mid-Century Modern', 'Retro silhouettes with timeless warmth.', 'living room', false, 4,
 '{"version":1,"room":{"width":15,"depth":19,"height":9},"wallColors":{"north":"#E7C7A0","south":"#F1ECE3","east":"#F1ECE3","west":"#F1ECE3"},"flooringId":"medium-oak","furniture":[{"productId":null,"name":"Sofa","modelUrl":null,"size":[7,2.4,3],"position":[0,0,-6],"rotationY":0,"scale":1},{"productId":null,"name":"Lounge Chair","modelUrl":null,"size":[3,2.6,3],"position":[-4,0,-2],"rotationY":0.5,"scale":1},{"productId":null,"name":"Coffee Table","modelUrl":null,"size":[3.5,1.2,2],"position":[0,0,-1],"rotationY":0,"scale":1}]}'::jsonb),
('Master Suite Retreat', 'A serene, spacious bedroom sanctuary.', 'bedroom', true, 5,
 '{"version":1,"room":{"width":14,"depth":16,"height":9},"wallColors":{"north":"#DCE3E0","south":"#F0F2F1","east":"#F0F2F1","west":"#F0F2F1"},"flooringId":"medium-oak","furniture":[{"productId":null,"name":"King Bed","modelUrl":null,"size":[7,2.5,7],"position":[0,0,-3],"rotationY":0,"scale":1},{"productId":null,"name":"Nightstand","modelUrl":null,"size":[1.6,1.8,1.5],"position":[-4.5,0,-4.5],"rotationY":0,"scale":1},{"productId":null,"name":"Nightstand","modelUrl":null,"size":[1.6,1.8,1.5],"position":[4.5,0,-4.5],"rotationY":0,"scale":1},{"productId":null,"name":"Dresser","modelUrl":null,"size":[5,2.6,1.7],"position":[0,0,6],"rotationY":0,"scale":1}]}'::jsonb),
('Small Bedroom', 'Smart, compact layout for snug spaces.', 'bedroom', false, 6,
 '{"version":1,"room":{"width":10,"depth":11,"height":8.5},"wallColors":{"north":"#EAE6F0","south":"#F5F3F8","east":"#F5F3F8","west":"#F5F3F8"},"flooringId":"light-oak","furniture":[{"productId":null,"name":"Full Bed","modelUrl":null,"size":[5,2.4,6.5],"position":[0,0,-2],"rotationY":0,"scale":1},{"productId":null,"name":"Nightstand","modelUrl":null,"size":[1.5,1.8,1.4],"position":[-3.2,0,-3.5],"rotationY":0,"scale":1}]}'::jsonb),
('Kids Room', 'Playful, durable and full of personality.', 'bedroom', false, 7,
 '{"version":1,"room":{"width":11,"depth":12,"height":8.5},"wallColors":{"north":"#CDE7F0","south":"#F4FAFC","east":"#F4FAFC","west":"#F4FAFC"},"flooringId":"light-oak","furniture":[{"productId":null,"name":"Twin Bed","modelUrl":null,"size":[4,2.2,6.5],"position":[-3,0,-2],"rotationY":0,"scale":1},{"productId":null,"name":"Desk","modelUrl":null,"size":[4,2.4,2],"position":[3,0,4],"rotationY":0,"scale":1},{"productId":null,"name":"Toy Storage","modelUrl":null,"size":[3,2,1.4],"position":[3,0,-4],"rotationY":0,"scale":1}]}'::jsonb),
('Executive Office', 'A focused, refined home workspace.', 'home office', true, 8,
 '{"version":1,"room":{"width":12,"depth":14,"height":9},"wallColors":{"north":"#2F3A40","south":"#E8EAEB","east":"#E8EAEB","west":"#E8EAEB"},"flooringId":"dark-walnut","furniture":[{"productId":null,"name":"Executive Desk","modelUrl":null,"size":[6,2.5,3],"position":[0,0,-4],"rotationY":0,"scale":1},{"productId":null,"name":"Office Chair","modelUrl":null,"size":[2.2,3.5,2.2],"position":[0,0,-1.5],"rotationY":3.14,"scale":1},{"productId":null,"name":"Bookshelf","modelUrl":null,"size":[4,6,1.3],"position":[5,0,2],"rotationY":-1.57,"scale":1}]}'::jsonb),
('Compact Workspace', 'Everything you need in a tidy footprint.', 'home office', false, 9,
 '{"version":1,"room":{"width":10,"depth":10,"height":8.5},"wallColors":{"north":"#E4EBE6","south":"#F4F7F5","east":"#F4F7F5","west":"#F4F7F5"},"flooringId":"medium-oak","furniture":[{"productId":null,"name":"Desk","modelUrl":null,"size":[4.5,2.4,2.2],"position":[0,0,-3.5],"rotationY":0,"scale":1},{"productId":null,"name":"Office Chair","modelUrl":null,"size":[2,3.4,2],"position":[0,0,-1.2],"rotationY":3.14,"scale":1}]}'::jsonb),
('Family Dining', 'Gather-round warmth for everyday meals.', 'dining room', true, 10,
 '{"version":1,"room":{"width":13,"depth":15,"height":9},"wallColors":{"north":"#EFE3D2","south":"#F7F1E8","east":"#F7F1E8","west":"#F7F1E8"},"flooringId":"medium-oak","furniture":[{"productId":null,"name":"Dining Table","modelUrl":null,"size":[6,2.5,3.5],"position":[0,0,0],"rotationY":0,"scale":1},{"productId":null,"name":"Sideboard","modelUrl":null,"size":[5,2.6,1.6],"position":[0,0,6],"rotationY":0,"scale":1}]}'::jsonb),
('Modern Dining', 'Sleek, sculptural and dinner-party ready.', 'dining room', false, 11,
 '{"version":1,"room":{"width":14,"depth":16,"height":9.5},"wallColors":{"north":"#33302C","south":"#EDEAE5","east":"#EDEAE5","west":"#EDEAE5"},"flooringId":"dark-walnut","furniture":[{"productId":null,"name":"Dining Table","modelUrl":null,"size":[7,2.5,3.5],"position":[0,0,0],"rotationY":0,"scale":1}]}'::jsonb),
('Open Kitchen', 'A bright, functional cook-and-gather space.', 'kitchen', false, 12,
 '{"version":1,"room":{"width":14,"depth":16,"height":9},"wallColors":{"north":"#E9EEF0","south":"#F6F8F9","east":"#F6F8F9","west":"#F6F8F9"},"flooringId":"tile-grey","furniture":[{"productId":null,"name":"Kitchen Island","modelUrl":null,"size":[6,3,3],"position":[0,0,0],"rotationY":0,"scale":1},{"productId":null,"name":"Bar Stool","modelUrl":null,"size":[1.5,3,1.5],"position":[-1.5,0,2.5],"rotationY":0,"scale":1},{"productId":null,"name":"Bar Stool","modelUrl":null,"size":[1.5,3,1.5],"position":[1.5,0,2.5],"rotationY":0,"scale":1}]}'::jsonb);