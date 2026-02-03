import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const FeaturedProductsSection = () => {
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const featuredProducts = products.filter(p => p.tags?.includes('bestseller')).slice(0, 4);

  return (
    <section className="bg-muted/30 py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Star className="h-4 w-4 fill-current" />
              Bestsellers
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Most Loved Pieces
            </h2>
            <p className="mt-3 max-w-lg text-lg text-muted-foreground">
              Discover what our community can't stop talking about
            </p>
          </div>
          <Link
            to="/catalog"
            className="group flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-3xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            featuredProducts.map((product, index) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Link
                  to={`/product/${product.id}`}
                  className="group relative block overflow-hidden rounded-3xl bg-background shadow-card transition-all duration-300 hover:shadow-elevated"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute left-4 top-4 flex flex-col gap-2">
                      {product.tags?.includes('bestseller') && (
                        <span className="rounded-full bg-gradient-to-r from-primary to-ai-coral px-3 py-1 text-xs font-semibold text-white">
                          Bestseller
                        </span>
                      )}
                      {product.tags?.includes('ai-recommended') && (
                        <span className="flex items-center gap-1 rounded-full bg-ai-purple/90 px-3 py-1 text-xs font-semibold text-white">
                          <Sparkles className="h-3 w-3" />
                          AI Pick
                        </span>
                      )}
                    </div>

                    {/* Wishlist button */}
                    <button 
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Add wishlist functionality
                      }}
                    >
                      <Heart className="h-5 w-5" />
                    </button>

                    {/* Quick add overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/95 to-background/80 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product);
                        }}
                        className="w-full rounded-xl"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-ai-amber text-ai-amber" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span>{product.reviewCount} reviews</span>
                    </div>
                    
                    <h3 className="mt-2 font-display text-lg font-semibold leading-tight">
                      {product.name}
                    </h3>
                    
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-lg font-bold">${product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
};
