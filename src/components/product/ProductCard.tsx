import { Link } from 'react-router-dom';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, Sparkles, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-background shadow-card transition-all duration-300 hover:shadow-elevated",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount && (
            <span className="rounded-full bg-gradient-to-r from-primary to-ai-coral px-3 py-1 text-xs font-semibold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {product.tags?.includes('new') && (
            <span className="rounded-full bg-charcoal px-3 py-1 text-xs font-semibold text-white shadow-sm">
              New
            </span>
          )}
          {product.tags?.includes('ai-recommended') && (
            <span className="flex items-center gap-1 rounded-full bg-ai-purple/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              AI Pick
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button 
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:text-primary group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Add wishlist functionality
          }}
        >
          <Heart className="h-5 w-5" />
        </button>

        {/* Quick Add Button */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/95 to-background/80 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="w-full gap-2 rounded-xl"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-ai-amber text-ai-amber" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{product.reviewCount} reviews</span>
        </div>
        
        <h3 className="mt-2 font-display text-lg font-semibold leading-tight">
          {product.name}
        </h3>
        
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
