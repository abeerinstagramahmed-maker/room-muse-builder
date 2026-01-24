import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRoomDesigner } from '@/hooks/useRoomDesigner';
import { useSavedDesigns } from '@/hooks/useSavedDesigns';
import { ImageUploader } from '@/components/designer/ImageUploader';
import { StyleSelector } from '@/components/designer/StyleSelector';
import { BudgetSelector } from '@/components/designer/BudgetSelector';
import { DesignResults } from '@/components/designer/DesignResults';
import { Sparkles, RefreshCw, Save, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Designer = () => {
  const { addMultipleItems } = useCart();
  const { isAuthenticated } = useAuthContext();
  const { saveDesign } = useSavedDesigns();
  const { toast } = useToast();
  const {
    uploadedImage,
    selectedStyle,
    selectedBudget,
    isGenerating,
    designResult,
    totalPrice,
    setSelectedStyle,
    setSelectedBudget,
    handleImageUpload,
    clearImage,
    handleGenerate,
  } = useRoomDesigner();

  const handleAddAllToCart = () => {
    if (designResult) {
      addMultipleItems(designResult.products);
    }
  };

  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save your design',
      });
      return;
    }

    if (!designResult || !selectedStyle || !selectedBudget) return;

    await saveDesign({
      name: `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Design`,
      image_url: uploadedImage || undefined,
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
      <div className="container py-8 md:py-12">
        {/* Header */}
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
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <ImageUploader
              uploadedImage={uploadedImage}
              onUpload={handleImageUpload}
              onClear={clearImage}
            />

            <StyleSelector
              selectedStyle={selectedStyle}
              onSelect={setSelectedStyle}
            />

            <BudgetSelector
              selectedBudget={selectedBudget}
              onSelect={setSelectedBudget}
            />

            {/* Generate Button */}
            <Button
              size="xl"
              variant="hero"
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={!uploadedImage || !selectedStyle || !selectedBudget || isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Designing Your Room...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Design
                </>
              )}
            </Button>

            {/* Save Design Button - only shown after results */}
            {designResult && (
              <div className="space-y-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleSaveDesign}
                  >
                    <Save className="h-4 w-4" />
                    Save Design to My Account
                  </Button>
                ) : (
                  <Link to="/auth" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign in to Save Design
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <DesignResults
            isGenerating={isGenerating}
            designResult={designResult}
            totalPrice={totalPrice}
            onAddAllToCart={handleAddAllToCart}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Designer;
