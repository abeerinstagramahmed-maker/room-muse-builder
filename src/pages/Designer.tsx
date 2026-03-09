import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRoomDesigner } from '@/hooks/useRoomDesigner';
import { useSavedDesigns } from '@/hooks/useSavedDesigns';
import { useSubscription } from '@/hooks/useSubscription';
import { ImageUploader } from '@/components/designer/ImageUploader';
import { StyleSelector } from '@/components/designer/StyleSelector';
import { BudgetSelector } from '@/components/designer/BudgetSelector';
import { DesignResults } from '@/components/designer/DesignResults';
import { Sparkles, RefreshCw, Save, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Designer = () => {
  const { addMultipleItems } = useCart();
  const { saveDesign } = useSavedDesigns();
  const { canDesign, isPro, remainingFreeDesigns, incrementDesignCount, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const {
    uploadedImage,
    selectedStyle,
    selectedBudget,
    isGenerating,
    pipelineStep,
    designResult,
    totalPrice,
    setSelectedStyle,
    setSelectedBudget,
    handleImageUpload,
    clearImage,
    handleGenerate: originalHandleGenerate,
  } = useRoomDesigner();

  const handleGenerate = async () => {
    if (!canDesign) {
      toast({
        title: 'Design limit reached',
        description: 'Upgrade to Pro for unlimited room redesigns.',
        variant: 'destructive',
      });
      return;
    }
    await originalHandleGenerate();
    await incrementDesignCount();
  };

  const handleAddAllToCart = () => {
    if (designResult) {
      addMultipleItems(designResult.products);
    }
  };

  const handleSaveDesign = async () => {
    if (!designResult || !selectedStyle || !selectedBudget) return;
    await saveDesign({
      name: `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Design`,
      image_url: designResult.generatedImageUrl || uploadedImage || undefined,
      style: selectedStyle,
      budget: selectedBudget,
      product_ids: designResult.products.map(p => p.id),
      ai_note: designResult.aiNote,
      style_notes: designResult.styleNotes,
      total_price: totalPrice,
    });
  };

  return (
    <Layout>
      <SEOHead title="AI Room Designer" description="Upload your room photo and get AI-powered furniture recommendations tailored to your style and budget." />
      <div className="container py-8 md:py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI Interior Designer
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Design Your Perfect Room
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Upload a photo of your space, choose your style, and let our AI create a stunning design just for you.
          </p>

          {!subLoading && (
            <div className="mt-4">
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--ai-amber))]/10 px-3 py-1.5 text-sm font-medium text-[hsl(var(--ai-amber))]">
                  <Crown className="h-4 w-4" />
                  Pro — Unlimited Designs
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                  Free Plan — {remainingFreeDesigns} design{remainingFreeDesigns !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
          )}
        </div>

        {!canDesign && !isPro && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <Lock className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="font-display text-lg font-semibold">You've used your free design</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to Pro for unlimited AI room redesigns starting at $9.99/month
            </p>
            <Link to="/pricing">
              <Button className="mt-4 gap-2 rounded-xl">
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <ImageUploader
              uploadedImage={uploadedImage}
              onUpload={handleImageUpload}
              onClear={clearImage}
            />
            <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
            <BudgetSelector selectedBudget={selectedBudget} onSelect={setSelectedBudget} />

            <Button
              size="xl"
              variant="hero"
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={!uploadedImage || !selectedStyle || !selectedBudget || isGenerating || !canDesign}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Designing Your Room...
                </>
              ) : !canDesign ? (
                <>
                  <Lock className="h-5 w-5" />
                  Upgrade to Design More
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Design
                </>
              )}
            </Button>

            {designResult && (
              <Button variant="outline" className="w-full gap-2" onClick={handleSaveDesign}>
                <Save className="h-4 w-4" />
                Save Design to My Account
              </Button>
            )}
          </div>

          <DesignResults
            isGenerating={isGenerating}
            pipelineStep={pipelineStep}
            designResult={designResult}
            totalPrice={totalPrice}
            onAddAllToCart={handleAddAllToCart}
            originalImage={uploadedImage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Designer;
