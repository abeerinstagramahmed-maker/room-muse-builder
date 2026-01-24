import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedDesign {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  style: string | null;
  budget: string | null;
  product_ids: string[];
  ai_note: string | null;
  style_notes: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
}

export function useSavedDesigns() {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  const fetchDesigns = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setDesigns([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      console.error('Error fetching designs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved designs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const saveDesign = useCallback(async (design: {
    name?: string;
    image_url?: string;
    style: string;
    budget: string;
    product_ids: string[];
    ai_note?: string;
    style_notes?: string;
    total_price?: number;
  }) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save your design',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .insert({
          user_id: user.id,
          name: design.name || 'Untitled Design',
          image_url: design.image_url,
          style: design.style,
          budget: design.budget,
          product_ids: design.product_ids,
          ai_note: design.ai_note,
          style_notes: design.style_notes,
          total_price: design.total_price,
        })
        .select()
        .single();

      if (error) throw error;

      setDesigns((prev) => [data, ...prev]);
      toast({
        title: 'Design saved!',
        description: 'Your design has been saved to your account',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error saving design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save design',
        variant: 'destructive',
      });
      return null;
    }
  }, [isAuthenticated, user, toast]);

  const deleteDesign = useCallback(async (designId: string) => {
    try {
      const { error } = await supabase
        .from('saved_designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      setDesigns((prev) => prev.filter((d) => d.id !== designId));
      toast({
        title: 'Design deleted',
        description: 'Your design has been removed',
      });
    } catch (error: any) {
      console.error('Error deleting design:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete design',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    designs,
    loading,
    saveDesign,
    deleteDesign,
    refetch: fetchDesigns,
  };
}
