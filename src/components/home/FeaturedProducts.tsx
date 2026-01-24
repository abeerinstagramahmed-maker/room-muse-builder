import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight } from 'lucide-react';

export const FeaturedProducts = () => {
  const products = getFeaturedProducts();

  return (
    <section className="bg-cream-dark py-16 md:py-24">
      <div className="container">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Bestsellers
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our most loved pieces, chosen by thousands of happy customers
            </p>
          </div>
          <Link
            to="/catalog"
            className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
