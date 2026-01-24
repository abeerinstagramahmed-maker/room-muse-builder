import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { products } from '@/lib/data';
import { Product } from '@/lib/types';
import { 
  Upload, 
  Sparkles, 
  ShoppingBag, 
  Palette, 
  DollarSign,
  RefreshCw,
  Check,
  ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const styles = [
  { id: 'modern', label: 'Modern Minimal', emoji: '🪴' },
  { id: 'scandinavian', label: 'Scandinavian', emoji: '🌿' },
  { id: 'industrial', label: 'Industrial', emoji: '🏭' },
  { id: 'bohemian', label: 'Bohemian', emoji: '🌸' },
  { id: 'traditional', label: 'Traditional', emoji: '🏛️' },
  { id: 'coastal', label: 'Coastal', emoji: '🌊' },
];

const budgets = [
  { id: 'budget', label: 'Budget-Friendly', range: 'Under $2,000' },
  { id: 'mid', label: 'Mid-Range', range: '$2,000 - $5,000' },
  { id: 'luxury', label: 'Luxury', range: '$5,000+' },
];

const Designer = () => {
  const { addMultipleItems } = useCart();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [designResult, setDesignResult] = useState<{
    products: Product[];
    aiNote: string;
  } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setDesignResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedStyle || !selectedBudget) return;

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock AI recommendations - in production, this would call your AI backend
    const recommendedProducts = products.slice(0, 5);
    
    setDesignResult({
      products: recommendedProducts,
      aiNote: `I love the natural light in your space! ✨ Based on your ${styles.find(s => s.id === selectedStyle)?.label} style preference and ${budgets.find(b => b.id === selectedBudget)?.label} budget, I've curated a collection that emphasizes clean lines, warm textures, and functional comfort. The Aria Modular Sofa will anchor the room beautifully, while the Luna Accent Chair adds a pop of personality. Let me know if you'd like me to adjust anything!`,
    });

    setIsGenerating(false);
  };

  const handleAddAllToCart = () => {
    if (designResult) {
      addMultipleItems(designResult.products);
    }
  };

  const totalPrice = designResult?.products.reduce((sum, p) => sum + p.price, 0) || 0;

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
            {/* Image Upload */}
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6">
              <label className="block cursor-pointer">
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Your room"
                      className="aspect-video w-full rounded-xl object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadedImage(null);
                        setDesignResult(null);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-background/90 p-2 shadow-md hover:bg-background"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-border bg-background">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-medium">Upload your room photo</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Style Selection */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                <Palette className="h-5 w-5 text-primary" />
                Choose Your Style
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all",
                      selectedStyle === style.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-xl">{style.emoji}</span>
                    <span className="text-sm font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Selection */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                <DollarSign className="h-5 w-5 text-primary" />
                Set Your Budget
              </h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {budgets.map((budget) => (
                  <button
                    key={budget.id}
                    onClick={() => setSelectedBudget(budget.id)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-3 text-left transition-all",
                      selectedBudget === budget.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="font-medium">{budget.label}</p>
                    <p className="text-sm text-muted-foreground">{budget.range}</p>
                  </button>
                ))}
              </div>
            </div>

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
          <div>
            {isGenerating ? (
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted/30">
                <div className="text-center">
                  <div className="mb-4 inline-flex animate-pulse rounded-full bg-primary/10 p-6">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <p className="font-display text-xl font-semibold">Creating magic...</p>
                  <p className="mt-1 text-muted-foreground">
                    Analyzing your space and curating the perfect pieces
                  </p>
                </div>
              </div>
            ) : designResult ? (
              <div className="space-y-6">
                {/* AI Note */}
                <div className="rounded-2xl bg-sage-light p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-full bg-sage p-1.5">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium">Your AI Designer Says</span>
                  </div>
                  <p className="text-muted-foreground">{designResult.aiNote}</p>
                </div>

                {/* Recommended Products */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold">
                      Recommended Products
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {designResult.products.length} items
                    </span>
                  </div>

                  <div className="space-y-3">
                    {designResult.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 rounded-xl bg-card p-3 shadow-sm"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Add to Cart */}
                <div className="rounded-2xl bg-primary/5 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-medium">Room Total</span>
                    <span className="font-display text-2xl font-bold">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    variant="hero"
                    className="w-full gap-2"
                    onClick={handleAddAllToCart}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Add Entire Room to Cart
                  </Button>
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    <Check className="mr-1 inline h-4 w-4 text-sage" />
                    All items are in stock and ready to ship
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted/30">
                <div className="text-center">
                  <div className="mb-4 inline-flex rounded-full bg-muted p-6">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="font-display text-xl font-semibold">Your Design Preview</p>
                  <p className="mt-1 text-muted-foreground">
                    Upload a photo and select your preferences to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Designer;
