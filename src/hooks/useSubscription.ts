import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  billing_period: string | null;
  current_period_end: string | null;
}

export function useSubscription() {
  const { user, isAuthenticated } = useAuthContext();
  const { subscriptionPricing } = useStoreSettings();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [designCount, setDesignCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setSubscription(subData as Subscription | null);

      // Fetch design count from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('design_count')
        .eq('user_id', user.id)
        .single();

      setDesignCount(profileData?.design_count ?? 0);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const freeDesigns = subscriptionPricing?.freeDesigns ?? 1;
  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';
  const canDesign = isPro || designCount < freeDesigns;
  const remainingFreeDesigns = Math.max(0, freeDesigns - designCount);

  const incrementDesignCount = async () => {
    if (!user) return;
    const { data } = await supabase.rpc('increment_design_count', { p_user_id: user.id });
    if (typeof data === 'number') {
      setDesignCount(data);
    }
  };

  return {
    subscription,
    designCount,
    loading,
    isPro,
    canDesign,
    remainingFreeDesigns,
    incrementDesignCount,
    refetch: fetchData,
  };
}
