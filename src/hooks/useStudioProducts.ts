import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudioProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  modelUrl: string | null;
  thumbnailUrl: string | null;
  images: string[];
  colors: string[];
  width: number | null;
  depth: number | null;
  height: number | null;
}

/** Footprint in feet, falling back to sensible defaults per category. */
export function productSize(p: StudioProduct): [number, number, number] {
  const w = p.width ?? 3;
  const h = p.height ?? 2.5;
  const d = p.depth ?? 3;
  return [w, h, d];
}

export function useStudioProducts() {
  return useQuery({
    queryKey: ['studio-products'],
    queryFn: async (): Promise<StudioProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, category, price, description, model_url, thumbnail_url, images, colors, width, depth, height',
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price ?? 0),
        description: p.description,
        modelUrl: p.model_url,
        thumbnailUrl: p.thumbnail_url ?? (p.images?.[0] ?? null),
        images: p.images ?? [],
        colors: p.colors ?? [],
        width: p.width != null ? Number(p.width) : null,
        depth: p.depth != null ? Number(p.depth) : null,
        height: p.height != null ? Number(p.height) : null,
      }));
    },
  });
}
