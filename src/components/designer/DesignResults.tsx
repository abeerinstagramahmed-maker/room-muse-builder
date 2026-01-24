import { Sparkles, ShoppingBag, Check, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { Link } from 'react-router-dom';

interface DesignResultsProps {
  isGenerating: boolean;
  designResult: {
    products: Product[];
    aiNote: string;
    styleNotes?: string;
  } | null;
  totalPrice: number;
  onAddAllToCart: () => void;
}

export function DesignResults({ 
  isGenerating, 
  designResult, 
  totalPrice, 
  onAddAllToCart 
}: DesignResultsProps) {
  if (isGenerating) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted/30">
        <div className="text-center">
          <div className="mb-4 inline-flex animate-pulse rounded-full bg-primary/10 p-6">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <p className="font-display text-xl font-semibold">Creating magic...</p>
          <p className="mt-1 text-muted-foreground">
            Our AI is analyzing your space and curating the perfect pieces
          </p>
        </div>
      </div>
    );
  }

  if (designResult) {
    return (
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
          {designResult.styleNotes && (
            <p className="mt-3 text-sm text-muted-foreground italic border-t border-sage/20 pt-3">
              💡 {designResult.styleNotes}
            </p>
          )}
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
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="flex items-center gap-4 rounded-xl bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
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
              </Link>
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
            onClick={onAddAllToCart}
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
    );
  }

  return (
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
  );
}
