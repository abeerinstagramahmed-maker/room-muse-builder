import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  images: string[];
  colors?: string[];
  dimensions?: { width: number; height: number; depth: number };
  materials?: string[];
  in_stock: boolean;
  vendor: string;
  tags?: string[];
  commission_percent: number;
}

export function useAdminProducts() {
  const { products, loading, refetch } = useProducts();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const createProduct = useCallback(async (data: ProductFormData) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: data.price,
          original_price: data.original_price || null,
          category: data.category,
          subcategory: data.subcategory || null,
          images: data.images,
          colors: data.colors || [],
          dimensions: data.dimensions || null,
          materials: data.materials || [],
          in_stock: data.in_stock,
          vendor: data.vendor,
          tags: data.tags || [],
          commission_percent: data.commission_percent,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast, refetch]);

  const updateProduct = useCallback(async (id: string, data: Partial<ProductFormData>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          original_price: data.original_price || null,
          category: data.category,
          subcategory: data.subcategory || null,
          images: data.images,
          colors: data.colors || [],
          dimensions: data.dimensions || null,
          materials: data.materials || [],
          in_stock: data.in_stock,
          vendor: data.vendor,
          tags: data.tags || [],
          commission_percent: data.commission_percent,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });

      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast, refetch]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });

      await refetch();
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast, refetch]);

  return {
    products,
    loading,
    saving,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
