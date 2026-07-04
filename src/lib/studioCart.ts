import { Product } from '@/lib/types';
import { StudioProduct } from '@/hooks/useStudioProducts';

/** Convert a StudioProduct into the full Product shape the cart expects. */
export function studioProductToProduct(p: StudioProduct): Product {
  const images = p.images.length
    ? p.images
    : p.thumbnailUrl
      ? [p.thumbnailUrl]
      : [];
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    category: p.category,
    images,
    colors: p.colors,
    dimensions:
      p.width != null && p.height != null && p.depth != null
        ? { width: p.width, height: p.height, depth: p.depth }
        : undefined,
    inStock: true,
    rating: 0,
    reviewCount: 0,
    vendor: '',
  };
}
