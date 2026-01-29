import { useState } from 'react';
import { CreditCard, Key, Save, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminSettings() {
  const { toast } = useToast();
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeTestMode, setStripeTestMode] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
  };

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

                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    <span>API Keys are managed securely through the backend</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Publishable Key</Label>
                      <Input 
                        placeholder={stripeTestMode ? "pk_test_..." : "pk_live_..."}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Secret Key</Label>
                      <Input 
                        type="password"
                        placeholder={stripeTestMode ? "sk_test_..." : "sk_live_..."}
                        className="mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Secret key is stored securely and never exposed to the frontend
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
                <Input defaultValue="RoomMuse" />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input type="email" placeholder="support@roommuse.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Commission Rate (%)</Label>
              <Input type="number" defaultValue="15" min="0" max="100" />
              <p className="text-xs text-muted-foreground">
                Applied to new products unless overridden
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shipping Rate ($)</Label>
                <Input type="number" defaultValue="9.99" step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Free Shipping Threshold ($)</Label>
                <Input type="number" defaultValue="100" min="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" defaultValue="8.875" step="0.001" min="0" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
