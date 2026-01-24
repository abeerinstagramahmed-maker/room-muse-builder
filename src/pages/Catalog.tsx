import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/product/ProductCard';
import { products, collections } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $2,000', min: 1000, max: 2000 },
  { label: '$2,000+', min: 2000, max: Infinity },
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
      const categoryName = collections.find(c => c.slug === selectedCategory)?.name;
      if (categoryName) {
        result = result.filter(p => p.category === categoryName);
      }
    }

    const priceRange = priceRanges[selectedPriceRange];
    result = result.filter(p => p.price >= priceRange.min && p.price < priceRange.max);

    return result;
  }, [selectedCategory, selectedPriceRange]);

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(0);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory || selectedPriceRange > 0;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {selectedCategory 
              ? collections.find(c => c.slug === selectedCategory)?.name || 'Shop All'
              : 'Shop All Furniture'
            }
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filteredProducts.length} products
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={cn(
            "w-full shrink-0 md:block md:w-64",
            showFilters ? "block" : "hidden"
          )}>
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={cn(
                      "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      !selectedCategory 
                        ? "bg-primary/10 font-medium text-primary" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All Products
                  </button>
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleCategoryChange(collection.slug)}
                      className={cn(
                        "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        selectedCategory === collection.slug
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {collection.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
                  Price
                </h3>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPriceRange(index)}
                      className={cn(
                        "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        selectedPriceRange === index
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/50 py-16">
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-1 text-muted-foreground">Try adjusting your filters</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
