import { useEffect, useState } from 'react';
import { CreditCard, Key, Save, ExternalLink, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminSettings() {
  const { 
    loading, 
    saving, 
    stripeSettings, 
    storeSettings, 
    saveSettings 
  } = useStoreSettings();

  // Local form state
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeTestMode, setStripeTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState('');
  
  const [storeName, setStoreName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [defaultCommission, setDefaultCommission] = useState('15');
  const [shippingRate, setShippingRate] = useState('9.99');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('100');
  const [taxRate, setTaxRate] = useState('8.875');

  // Sync form state with fetched settings
  useEffect(() => {
    if (!loading) {
      setStripeEnabled(stripeSettings.enabled);
      setStripeTestMode(stripeSettings.testMode);
      setPublishableKey(stripeSettings.publishableKey);
      
      setStoreName(storeSettings.name);
      setSupportEmail(storeSettings.supportEmail);
      setDefaultCommission(storeSettings.defaultCommission.toString());
      setShippingRate(storeSettings.shippingRate.toString());
      setFreeShippingThreshold(storeSettings.freeShippingThreshold.toString());
      setTaxRate(storeSettings.taxRate.toString());
    }
  }, [loading, stripeSettings, storeSettings]);

  const handleSaveSettings = async () => {
    await saveSettings(
      {
        enabled: stripeEnabled,
        testMode: stripeTestMode,
        publishableKey,
      },
      {
        name: storeName,
        supportEmail,
        defaultCommission: parseFloat(defaultCommission) || 15,
        shippingRate: parseFloat(shippingRate) || 9.99,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 100,
        taxRate: parseFloat(taxRate) || 8.875,
      }
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your store settings</p>
        </div>

        {/* Stripe Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#635BFF]/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#635BFF]" />
              </div>
              <div>
                <CardTitle className="font-display">Stripe Payments</CardTitle>
                <CardDescription>Configure Stripe to accept payments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Stripe Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Accept credit card payments through Stripe
                </p>
              </div>
              <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
            </div>

            {stripeEnabled && (
              <>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use Stripe test keys for development
                    </p>
                  </div>
                  <Switch checked={stripeTestMode} onCheckedChange={setStripeTestMode} />
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Enter your Stripe {stripeTestMode ? 'test' : 'live'} publishable key below. 
                    The secret key should be configured securely in the backend.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Publishable Key</Label>
                      <Input 
                        value={publishableKey}
                        onChange={(e) => setPublishableKey(e.target.value)}
                        placeholder={stripeTestMode ? "pk_test_..." : "pk_live_..."}
                        className="mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This key is safe to use in frontend code
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://dashboard.stripe.com/apikeys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get API Keys from Stripe
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Store Settings</CardTitle>
            <CardDescription>General store configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@roommuse.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Commission Rate (%)</Label>
              <Input 
                type="number" 
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(e.target.value)}
                min="0" 
                max="100" 
              />
              <p className="text-xs text-muted-foreground">
                Applied to new products unless overridden
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shipping Rate ($)</Label>
                <Input 
                  type="number" 
                  value={shippingRate}
                  onChange={(e) => setShippingRate(e.target.value)}
                  step="0.01" 
                  min="0" 
                />
              </div>
              <div className="space-y-2">
                <Label>Free Shipping Threshold ($)</Label>
                <Input 
                  type="number" 
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  min="0" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input 
                type="number" 
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                step="0.001" 
                min="0" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
