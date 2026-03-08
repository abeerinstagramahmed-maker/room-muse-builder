import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuthContext();
  const { toast } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);
      if (error) throw error;
      setWishlistIds(data?.map(w => w.product_id) || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated || !user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save favorites', variant: 'destructive' });
      return;
    }
    const isWishlisted = wishlistIds.includes(productId);
    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        setWishlistIds(prev => prev.filter(id => id !== productId));
        toast({ title: 'Removed from favorites' });
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        setWishlistIds(prev => [...prev, productId]);
        toast({ title: 'Added to favorites' });
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      toast({ title: 'Error', description: 'Failed to update favorites', variant: 'destructive' });
    }
  }, [user, isAuthenticated, wishlistIds, toast]);

  const isWishlisted = useCallback((productId: string) => wishlistIds.includes(productId), [wishlistIds]);

  return { wishlistIds, loading, toggleWishlist, isWishlisted };
}
