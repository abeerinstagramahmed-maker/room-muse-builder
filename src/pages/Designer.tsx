import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useRoomDesigner } from '@/hooks/useRoomDesigner';
import { ImageUploader } from '@/components/designer/ImageUploader';
import { StyleSelector } from '@/components/designer/StyleSelector';
import { BudgetSelector } from '@/components/designer/BudgetSelector';
import { DesignResults } from '@/components/designer/DesignResults';
import { Sparkles, RefreshCw } from 'lucide-react';

const Designer = () => {
  const { addMultipleItems } = useCart();
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

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-terracotta-light px-4 py-2 text-sm font-medium text-primary">
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
