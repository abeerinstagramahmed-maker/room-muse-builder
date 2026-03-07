import { useEffect, useState } from 'react';
import { CreditCard, Key, Save, ExternalLink, Loader2, Crown, ShoppingCart, Search as SearchIcon } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminSettings() {
  const { 
    loading, saving, stripeSettings, storeSettings, subscriptionPricing, saveSettings 
  } = useStoreSettings();

  // Local form state
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeTestMode, setStripeTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  const [storeName, setStoreName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [defaultCommission, setDefaultCommission] = useState('15');
  const [shippingRate, setShippingRate] = useState('9.99');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('100');
  const [taxRate, setTaxRate] = useState('8.875');

  const [monthlyPrice, setMonthlyPrice] = useState('9.99');
  const [yearlyPrice, setYearlyPrice] = useState('99');
  const [freeDesigns, setFreeDesigns] = useState('1');

  // Product sourcing
  const [productMarkup, setProductMarkup] = useState('5');
  const [amazonApiKey, setAmazonApiKey] = useState('');
  const [amazonApiSecret, setAmazonApiSecret] = useState('');
  const [amazonAssociateTag, setAmazonAssociateTag] = useState('');
  const [firecrawlApiKey, setFirecrawlApiKey] = useState('');
  const [autoOrderEnabled, setAutoOrderEnabled] = useState(false);

  useEffect(() => {
    if (!loading) {
      setStripeEnabled(stripeSettings.enabled);
      setStripeTestMode(stripeSettings.testMode);
      setPublishableKey(stripeSettings.publishableKey);
      setSecretKey(stripeSettings.secretKey || '');
      
      setStoreName(storeSettings.name);
      setSupportEmail(storeSettings.supportEmail);
      setDefaultCommission(storeSettings.defaultCommission.toString());
      setShippingRate(storeSettings.shippingRate.toString());
      setFreeShippingThreshold(storeSettings.freeShippingThreshold.toString());
      setTaxRate(storeSettings.taxRate.toString());

      setMonthlyPrice(subscriptionPricing.monthlyPrice.toString());
      setYearlyPrice(subscriptionPricing.yearlyPrice.toString());
      setFreeDesigns(subscriptionPricing.freeDesigns.toString());

      // Load product sourcing settings from storeSettings extended fields
      setProductMarkup((storeSettings as any).productMarkup?.toString() || '5');
      setAmazonApiKey((storeSettings as any).amazonApiKey || '');
      setAmazonApiSecret((storeSettings as any).amazonApiSecret || '');
      setAmazonAssociateTag((storeSettings as any).amazonAssociateTag || '');
      setFirecrawlApiKey((storeSettings as any).firecrawlApiKey || '');
      setAutoOrderEnabled((storeSettings as any).autoOrderEnabled || false);
    }
  }, [loading, stripeSettings, storeSettings, subscriptionPricing]);

  const handleSaveSettings = async () => {
    await saveSettings(
      {
        enabled: stripeEnabled,
        testMode: stripeTestMode,
        publishableKey,
        secretKey,
      },
      {
        name: storeName,
        supportEmail,
        defaultCommission: parseFloat(defaultCommission) || 15,
        shippingRate: parseFloat(shippingRate) || 9.99,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 100,
        taxRate: parseFloat(taxRate) || 8.875,
        productMarkup: parseFloat(productMarkup) || 5,
        amazonApiKey,
        amazonApiSecret,
        amazonAssociateTag,
        firecrawlApiKey,
        autoOrderEnabled,
      } as any,
      {
        monthlyPrice: parseFloat(monthlyPrice) || 9.99,
        yearlyPrice: parseFloat(yearlyPrice) || 99,
        freeDesigns: parseInt(freeDesigns) || 1,
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
          <p className="text-muted-foreground">Configure your store, payments, and integrations</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="product-sourcing">Product Sourcing</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Store Settings</CardTitle>
                <CardDescription>General store configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@roomly.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Commission Rate (%)</Label>
                  <Input type="number" value={defaultCommission} onChange={(e) => setDefaultCommission(e.target.value)} min="0" max="100" />
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Shipping Rate ($)</Label>
                    <Input type="number" value={shippingRate} onChange={(e) => setShippingRate(e.target.value)} step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Free Shipping Threshold ($)</Label>
                    <Input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} min="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} step="0.001" min="0" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-4 mt-4">
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
                    <p className="text-sm text-muted-foreground">Accept credit card payments through Stripe</p>
                  </div>
                  <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
                </div>

                {stripeEnabled && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Test Mode</Label>
                        <p className="text-sm text-muted-foreground">Use Stripe test keys for development</p>
                      </div>
                      <Switch checked={stripeTestMode} onCheckedChange={setStripeTestMode} />
                    </div>

                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        Enter your Stripe {stripeTestMode ? 'test' : 'live'} keys below.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Publishable Key</Label>
                          <Input value={publishableKey} onChange={(e) => setPublishableKey(e.target.value)} placeholder={stripeTestMode ? "pk_test_..." : "pk_live_..."} className="mt-1 font-mono text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Secret Key</Label>
                          <Input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder={stripeTestMode ? "sk_test_..." : "sk_live_..."} className="mt-1 font-mono text-sm" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get API Keys from Stripe
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subscriptions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ai-amber))]/10 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-[hsl(var(--ai-amber))]" />
                  </div>
                  <div>
                    <CardTitle className="font-display">Subscription Pricing</CardTitle>
                    <CardDescription>Configure Pro plan pricing and free tier limits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Monthly Price ($)</Label>
                    <Input type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} step="0.01" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Yearly Price ($)</Label>
                    <Input type="number" value={yearlyPrice} onChange={(e) => setYearlyPrice(e.target.value)} step="0.01" min="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Free Designs (per user)</Label>
                  <Input type="number" value={freeDesigns} onChange={(e) => setFreeDesigns(e.target.value)} min="0" max="100" />
                  <p className="text-xs text-muted-foreground">
                    Number of room designs free users can generate before requiring a subscription
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Sourcing */}
          <TabsContent value="product-sourcing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ai-amber))]/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-[hsl(var(--ai-amber))]" />
                  </div>
                  <div>
                    <CardTitle className="font-display">Amazon Product API</CardTitle>
                    <CardDescription>Fetch real products from Amazon with automatic pricing markup</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Price Markup (%)</Label>
                  <Input type="number" value={productMarkup} onChange={(e) => setProductMarkup(e.target.value)} min="0" max="100" step="0.5" />
                  <p className="text-xs text-muted-foreground">
                    Percentage added to the original product price (e.g., 5% markup on a $100 item = $105 on your store)
                  </p>
                </div>
                <Separator />
                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-xs text-muted-foreground">Amazon API Access Key</Label>
                    <Input value={amazonApiKey} onChange={(e) => setAmazonApiKey(e.target.value)} placeholder="AKIA..." className="mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Amazon API Secret Key</Label>
                    <Input type="password" value={amazonApiSecret} onChange={(e) => setAmazonApiSecret(e.target.value)} placeholder="Your secret key..." className="mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Amazon Associate Tag</Label>
                    <Input value={amazonAssociateTag} onChange={(e) => setAmazonAssociateTag(e.target.value)} placeholder="yourtag-20" className="mt-1 font-mono text-sm" />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://affiliate-program.amazon.com/assoc_credentials/home" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get Amazon API Keys
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ai-coral))]/10 flex items-center justify-center">
                    <SearchIcon className="h-5 w-5 text-[hsl(var(--ai-coral))]" />
                  </div>
                  <div>
                    <CardTitle className="font-display">Web Scraping (Firecrawl)</CardTitle>
                    <CardDescription>AI-powered scraping from Wayfair, West Elm, Pottery Barn & more</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-xs text-muted-foreground">Firecrawl API Key</Label>
                    <Input type="password" value={firecrawlApiKey} onChange={(e) => setFirecrawlApiKey(e.target.value)} placeholder="fc-..." className="mt-1 font-mono text-sm" />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get Firecrawl API Key
                    </a>
                  </Button>
                </div>
                <Alert>
                  <SearchIcon className="h-4 w-4" />
                  <AlertDescription>
                    Firecrawl enables scraping products from US furniture stores like Wayfair, West Elm, Pottery Barn, and Crate & Barrel. Products are automatically imported with a {productMarkup}% markup.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment */}
          <TabsContent value="fulfillment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Order Fulfillment</CardTitle>
                <CardDescription>Configure how orders are placed with vendors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Order Placement</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically place orders with vendors when a customer completes checkout
                    </p>
                  </div>
                  <Switch checked={autoOrderEnabled} onCheckedChange={setAutoOrderEnabled} />
                </div>
                {!autoOrderEnabled && (
                  <Alert>
                    <AlertDescription>
                      Orders will need to be manually placed with vendors. You'll receive notifications for new orders in the Orders tab.
                    </AlertDescription>
                  </Alert>
                )}
                {autoOrderEnabled && (
                  <Alert>
                    <AlertDescription>
                      ⚠️ Automatic ordering requires vendor API integrations to be configured. This feature is being built — orders will be queued for manual placement until vendor APIs are connected.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
