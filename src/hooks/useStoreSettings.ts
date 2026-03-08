import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StripeSettings {
  enabled: boolean;
  testMode: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSigningSecret?: string;
}

interface StoreSettings {
  name: string;
  supportEmail: string;
  defaultCommission: number;
  shippingRate: number;
  freeShippingThreshold: number;
  taxRate: number;
}

interface SubscriptionPricing {
  monthlyPrice: number;
  yearlyPrice: number;
  freeDesigns: number;
}

const defaultStripeSettings: StripeSettings = {
  enabled: false,
  testMode: true,
  publishableKey: '',
  secretKey: '',
};

const defaultStoreSettings: StoreSettings = {
  name: 'Roomly',
  supportEmail: '',
  defaultCommission: 15,
  shippingRate: 9.99,
  freeShippingThreshold: 100,
  taxRate: 8.875,
};

const defaultSubscriptionPricing: SubscriptionPricing = {
  monthlyPrice: 9.99,
  yearlyPrice: 99,
  freeDesigns: 1,
};

export function useStoreSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>(defaultStripeSettings);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [subscriptionPricing, setSubscriptionPricing] = useState<SubscriptionPricing>(defaultSubscriptionPricing);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.key === 'stripe') {
          setStripeSettings(setting.value as unknown as StripeSettings);
        } else if (setting.key === 'store') {
          setStoreSettings(setting.value as unknown as StoreSettings);
        } else if (setting.key === 'subscription_pricing') {
          setSubscriptionPricing(setting.value as unknown as SubscriptionPricing);
        }
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const upsertSetting = async (key: string, value: any) => {
    // Try update first, then insert if no rows affected
    const { data, error: updateError } = await supabase
      .from('store_settings')
      .update({ value: JSON.parse(JSON.stringify(value)) })
      .eq('key', key)
      .select();

    if (updateError) throw updateError;

    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from('store_settings')
        .insert({ key, value: JSON.parse(JSON.stringify(value)) });
      if (insertError) throw insertError;
    }
  };

  const saveSettings = async (stripe: StripeSettings, store: StoreSettings, pricing?: SubscriptionPricing) => {
    setSaving(true);
    try {
      await upsertSetting('stripe', stripe);
      await upsertSetting('store', store);

      // Also save email settings separately for edge functions
      if ((store as any).emailSettings) {
        await upsertSetting('email', (store as any).emailSettings);
      }

      if (pricing) {
        await upsertSetting('subscription_pricing', pricing);
        setSubscriptionPricing(pricing);
      }

      setStripeSettings(stripe);
      setStoreSettings(store);

      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });

      return true;
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    stripeSettings,
    storeSettings,
    subscriptionPricing,
    setStripeSettings,
    setStoreSettings,
    saveSettings,
    refetch: fetchSettings,
  };
}
