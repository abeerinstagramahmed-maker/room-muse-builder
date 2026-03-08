import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews((data as Review[]) || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = useCallback(async (rating: number, title: string, body: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({ user_id: user.id, product_id: productId, rating, title, body });
      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already reviewed', description: 'You have already reviewed this product', variant: 'destructive' });
          return;
        }
        throw error;
      }
      toast({ title: 'Review submitted!' });
      fetchReviews();
    } catch (err) {
      console.error('Error adding review:', err);
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    }
  }, [user, productId, toast, fetchReviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = user ? reviews.find(r => r.user_id === user.id) : null;

  return { reviews, loading, addReview, averageRating, userReview };
}
