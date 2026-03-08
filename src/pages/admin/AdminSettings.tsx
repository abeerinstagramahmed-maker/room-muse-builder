import { useEffect, useState } from 'react';
import { CreditCard, Key, Save, ExternalLink, Loader2, Crown, ShoppingCart, Search as SearchIcon, Brain, Bot, Cpu, ToggleLeft, Mail, Bell, RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { defaultAISettings, AISettings } from '@/services/aiProvider';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminSettings() {
  const { 
    loading, saving, stripeSettings, storeSettings, subscriptionPricing, saveSettings 
  } = useStoreSettings();

  // Local form state
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeTestMode, setStripeTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSigningSecret, setWebhookSigningSecret] = useState('');

  // Email settings
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [resendApiKey, setResendApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [emailOnConfirmation, setEmailOnConfirmation] = useState(true);
  const [emailOnShipped, setEmailOnShipped] = useState(true);
  const [emailOnDelivered, setEmailOnDelivered] = useState(true);
  
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

  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>(defaultAISettings);

  useEffect(() => {
    if (!loading) {
      setStripeEnabled(stripeSettings.enabled);
      setStripeTestMode(stripeSettings.testMode);
      setPublishableKey(stripeSettings.publishableKey);
      setSecretKey(stripeSettings.secretKey || '');
      setWebhookSigningSecret((stripeSettings as any).webhookSigningSecret || '');
      
      setStoreName(storeSettings.name);
      setSupportEmail(storeSettings.supportEmail);
      setDefaultCommission(storeSettings.defaultCommission.toString());
      setShippingRate(storeSettings.shippingRate.toString());
      setFreeShippingThreshold(storeSettings.freeShippingThreshold.toString());
      setTaxRate(storeSettings.taxRate.toString());

      setMonthlyPrice(subscriptionPricing.monthlyPrice.toString());
      setYearlyPrice(subscriptionPricing.yearlyPrice.toString());
      setFreeDesigns(subscriptionPricing.freeDesigns.toString());

      setProductMarkup((storeSettings as any).productMarkup?.toString() || '5');
      setAmazonApiKey((storeSettings as any).amazonApiKey || '');
      setAmazonApiSecret((storeSettings as any).amazonApiSecret || '');
      setAmazonAssociateTag((storeSettings as any).amazonAssociateTag || '');
      setFirecrawlApiKey((storeSettings as any).firecrawlApiKey || '');
      setAutoOrderEnabled((storeSettings as any).autoOrderEnabled || false);

      // Load email settings
      const emailData = (storeSettings as any).emailSettings;
      if (emailData) {
        setEmailEnabled(emailData.enabled ?? false);
        setResendApiKey(emailData.resendApiKey ?? '');
        setFromEmail(emailData.fromEmail ?? '');
        setFromName(emailData.fromName ?? '');
        setEmailOnConfirmation(emailData.emailOnConfirmation ?? true);
        setEmailOnShipped(emailData.emailOnShipped ?? true);
        setEmailOnDelivered(emailData.emailOnDelivered ?? true);
      }
    }
  }, [loading, stripeSettings, storeSettings, subscriptionPricing]);

  const handleSaveSettings = async () => {
    await saveSettings(
      {
        enabled: stripeEnabled,
        testMode: stripeTestMode,
        publishableKey,
        secretKey,
        webhookSigningSecret,
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
        aiSettings,
        emailSettings: {
          enabled: emailEnabled,
          resendApiKey,
          fromEmail,
          fromName,
          emailOnConfirmation,
          emailOnShipped,
          emailOnDelivered,
        },
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
          <p className="text-muted-foreground">Configure your store, payments, AI, and integrations</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
            <TabsTrigger value="product-sourcing">Product Sourcing</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
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
                        <div>
                          <Label className="text-xs text-muted-foreground">Webhook Signing Secret</Label>
                          <Input type="password" value={webhookSigningSecret} onChange={(e) => setWebhookSigningSecret(e.target.value)} placeholder="whsec_..." className="mt-1 font-mono text-sm" />
                          <p className="text-xs text-muted-foreground mt-1">Optional — verifies webhook requests from Stripe. Find it in Stripe Dashboard → Webhooks.</p>
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

          {/* AI Settings — NEW */}
          <TabsContent value="ai-settings" className="space-y-4 mt-4">
            {/* API Keys */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display">AI API Keys</CardTitle>
                    <CardDescription>Configure API keys for AI providers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-xs text-muted-foreground">Replicate API Key</Label>
                    <Input
                      type="password"
                      value={aiSettings.replicateApiKey}
                      onChange={(e) => setAiSettings(s => ({ ...s, replicateApiKey: e.target.value }))}
                      placeholder="r8_..."
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used for room image generation (SDXL + ControlNet), furniture detection (DINO + SAM), and room analysis (BLIP-2)</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">OpenAI API Key</Label>
                    <Input
                      type="password"
                      value={aiSettings.openaiApiKey}
                      onChange={(e) => setAiSettings(s => ({ ...s, openaiApiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used for furniture planning and product recommendations (GPT-4o)</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Anthropic API Key</Label>
                    <Input
                      type="password"
                      value={aiSettings.anthropicApiKey}
                      onChange={(e) => setAiSettings(s => ({ ...s, anthropicApiKey: e.target.value }))}
                      placeholder="sk-ant-..."
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Alternative provider for furniture planning (Claude Sonnet/Haiku)</p>
                  </div>
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    API keys are stored securely. The system currently runs in <strong>development mode</strong> with mock responses until valid API keys are configured.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Default Models */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ai-coral))]/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-[hsl(var(--ai-coral))]" />
                  </div>
                  <div>
                    <CardTitle className="font-display">Default Models</CardTitle>
                    <CardDescription>Select which AI models to use for each pipeline step</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Room Analysis Model</Label>
                    <Select value={aiSettings.roomAnalysisModel} onValueChange={(v) => setAiSettings(s => ({ ...s, roomAnalysisModel: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blip2">BLIP-2 (Replicate)</SelectItem>
                        <SelectItem value="llava">LLaVA (Replicate)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o Vision (OpenAI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Furniture Detection Model</Label>
                    <Select value={aiSettings.furnitureDetectionModel} onValueChange={(v) => setAiSettings(s => ({ ...s, furnitureDetectionModel: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grounding-dino-sam">Grounding DINO + SAM (Replicate)</SelectItem>
                        <SelectItem value="yolo-v8">YOLOv8 (Replicate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Generation Model</Label>
                    <Select value={aiSettings.roomGenerationModel} onValueChange={(v) => setAiSettings(s => ({ ...s, roomGenerationModel: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sdxl-controlnet">SDXL + ControlNet (Replicate)</SelectItem>
                        <SelectItem value="sdxl-depth">SDXL + Depth ControlNet (Replicate)</SelectItem>
                        <SelectItem value="sdxl-canny">SDXL + Canny ControlNet (Replicate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Recommendation Model</Label>
                    <Select value={aiSettings.productRecommendationModel} onValueChange={(v) => setAiSettings(s => ({ ...s, productRecommendationModel: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o mini (OpenAI)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                        <SelectItem value="claude-haiku">Claude Haiku (Anthropic)</SelectItem>
                        <SelectItem value="claude-sonnet">Claude Sonnet (Anthropic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Toggles */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--ai-amber))]/10 flex items-center justify-center">
                    <ToggleLeft className="h-5 w-5 text-[hsl(var(--ai-amber))]" />
                  </div>
                  <div>
                    <CardTitle className="font-display">Feature Toggles</CardTitle>
                    <CardDescription>Enable or disable AI pipeline features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Generation</Label>
                    <p className="text-sm text-muted-foreground">Generate redesigned room images using SDXL + ControlNet</p>
                  </div>
                  <Switch checked={aiSettings.enableAIGeneration} onCheckedChange={(v) => setAiSettings(s => ({ ...s, enableAIGeneration: v }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Furniture Detection</Label>
                    <p className="text-sm text-muted-foreground">Detect existing furniture using Grounding DINO + SAM</p>
                  </div>
                  <Switch checked={aiSettings.enableFurnitureDetection} onCheckedChange={(v) => setAiSettings(s => ({ ...s, enableFurnitureDetection: v }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Product Scraping</Label>
                    <p className="text-sm text-muted-foreground">Scrape products from Amazon, Etsy, IKEA, and other furniture stores</p>
                  </div>
                  <Switch checked={aiSettings.enableProductScraping} onCheckedChange={(v) => setAiSettings(s => ({ ...s, enableProductScraping: v }))} />
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

          {/* Email Notifications */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display">Email Notifications</CardTitle>
                    <CardDescription>Send order emails via Resend</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send order updates to customers via email</p>
                  </div>
                  <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                </div>
                {emailEnabled && (
                  <>
                    <Separator />
                    <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                      <div>
                        <Label className="text-xs text-muted-foreground">Resend API Key</Label>
                        <Input type="password" value={resendApiKey} onChange={(e) => setResendApiKey(e.target.value)} placeholder="re_..." className="mt-1 font-mono text-sm" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">From Email</Label>
                          <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="orders@yourdomain.com" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">From Name</Label>
                          <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Roomly" className="mt-1" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Resend API Key
                        </a>
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-display text-sm font-semibold">Notification Triggers</h4>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Confirmation</Label>
                          <p className="text-xs text-muted-foreground">When payment is confirmed</p>
                        </div>
                        <Switch checked={emailOnConfirmation} onCheckedChange={setEmailOnConfirmation} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Shipped</Label>
                          <p className="text-xs text-muted-foreground">When admin marks as shipped</p>
                        </div>
                        <Switch checked={emailOnShipped} onCheckedChange={setEmailOnShipped} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Delivered</Label>
                          <p className="text-xs text-muted-foreground">When admin marks as delivered</p>
                        </div>
                        <Switch checked={emailOnDelivered} onCheckedChange={setEmailOnDelivered} />
                      </div>
                    </div>
                    <Alert>
                      <Bell className="h-4 w-4" />
                      <AlertDescription>
                        To send emails from your own domain (e.g., orders@yourdomain.com), verify your domain in Resend first. Otherwise, use Resend's default sender.
                      </AlertDescription>
                    </Alert>
                  </>
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
