import { Link } from 'react-router-dom';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCart();

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
        "group flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-card-hover",
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
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              -{discount}%
            </span>
          )}
          {product.tags?.includes('new') && (
            <span className="rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              New
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            onClick={handleAddToCart}
            variant="default"
            className="w-full gap-2 bg-background/95 text-foreground backdrop-blur-sm hover:bg-background"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
          <span>{product.rating}</span>
          <span className="mx-1">·</span>
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
            <span className="font-semibold">${product.price.toLocaleString()}</span>
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
