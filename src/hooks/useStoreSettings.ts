import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StripeSettings {
  enabled: boolean;
  testMode: boolean;
  publishableKey: string;
}

interface StoreSettings {
  name: string;
  supportEmail: string;
  defaultCommission: number;
  shippingRate: number;
  freeShippingThreshold: number;
  taxRate: number;
}

const defaultStripeSettings: StripeSettings = {
  enabled: false,
  testMode: true,
  publishableKey: '',
};

const defaultStoreSettings: StoreSettings = {
  name: 'RoomMuse',
  supportEmail: '',
  defaultCommission: 15,
  shippingRate: 9.99,
  freeShippingThreshold: 100,
  taxRate: 8.875,
};

export function useStoreSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>(defaultStripeSettings);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);

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
        }
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (stripe: StripeSettings, store: StoreSettings) => {
    setSaving(true);
    try {
      // Update stripe settings
      const { error: stripeError } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(stripe)) })
        .eq('key', 'stripe');

      if (stripeError) throw stripeError;

      // Update store settings
      const { error: storeError } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(store)) })
        .eq('key', 'store');

      if (storeError) throw storeError;

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
    setStripeSettings,
    setStoreSettings,
    saveSettings,
    refetch: fetchSettings,
  };
}
