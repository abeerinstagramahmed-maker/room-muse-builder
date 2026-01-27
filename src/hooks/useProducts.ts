import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { Json } from '@/integrations/supabase/types';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  subcategory: string | null;
  images: string[];
  colors: string[] | null;
  dimensions: Json | null;
  materials: string[] | null;
  in_stock: boolean;
  rating: number | null;
  review_count: number | null;
  vendor: string;
  tags: string[] | null;
}

function parseDimensions(dimensions: Json | null): { width: number; height: number; depth: number } | undefined {
  if (!dimensions || typeof dimensions !== 'object' || Array.isArray(dimensions)) {
    return undefined;
  }
  const dim = dimensions as Record<string, unknown>;
  return {
    width: typeof dim.width === 'number' ? dim.width : 0,
    height: typeof dim.height === 'number' ? dim.height : 0,
    depth: typeof dim.depth === 'number' ? dim.depth : 0,
  };
}

function mapDatabaseProductToProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    originalPrice: dbProduct.original_price || undefined,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory || undefined,
    images: dbProduct.images,
    colors: dbProduct.colors || undefined,
    dimensions: parseDimensions(dbProduct.dimensions),
    materials: dbProduct.materials || undefined,
    inStock: dbProduct.in_stock,
    rating: dbProduct.rating || 0,
    reviewCount: dbProduct.review_count || 0,
    vendor: dbProduct.vendor,
    tags: dbProduct.tags || undefined,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProducts = (data || []).map(mapDatabaseProductToProduct);
      setProducts(mappedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapDatabaseProductToProduct(data as DatabaseProduct);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      return null;
    }
  }, []);

  const getProductsByCategory = useCallback((category: string): Product[] => {
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }, [products]);

  const getFeaturedProducts = useCallback((): Product[] => {
    return products.filter(p => p.tags?.includes('bestseller')).slice(0, 4);
  }, [products]);

  const getNewProducts = useCallback((): Product[] => {
    return products.filter(p => p.tags?.includes('new'));
  }, [products]);

  const getProductsByIds = useCallback(async (ids: string[]): Promise<Product[]> => {
    if (ids.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      if (error) throw error;

      return (data || []).map(mapDatabaseProductToProduct);
    } catch (err: any) {
      console.error('Error fetching products by ids:', err);
      return [];
    }
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    getNewProducts,
    getProductsByIds,
  };
}
