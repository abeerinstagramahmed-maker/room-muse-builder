import { Link } from 'react-router-dom';
import { collections } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export const Collections = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Shop by Room
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explore our curated collections for every space in your home
            </p>
          </div>
          <Link
            to="/catalog"
            className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/catalog?category=${collection.slug}`}
              className="group relative overflow-hidden rounded-2xl animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={collection.imageUrl}
                  alt={collection.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-xl font-semibold text-primary-foreground">
                  {collection.name}
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/70">
                  {collection.productCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
