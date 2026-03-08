import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/product/ProductCard';
import { RecentlyViewedSection } from '@/components/product/RecentlyViewedSection';
import { collections } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEOHead } from '@/components/SEOHead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $2,000', min: 1000, max: 2000 },
  { label: '$2,000+', min: 2000, max: Infinity },
];

const styleOptions = ['modern', 'scandinavian', 'industrial', 'bohemian', 'traditional', 'coastal'];
const materialOptions = ['wood', 'metal', 'fabric', 'leather', 'glass', 'marble', 'rattan'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('q') || '';
  const { products, loading } = useProducts();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.vendor.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      const categoryName = collections.find(c => c.slug === selectedCategory)?.name;
      if (categoryName) {
        result = result.filter(p => p.category === categoryName);
      }
    }

    // Price filter
    const priceRange = priceRanges[selectedPriceRange];
    result = result.filter(p => p.price >= priceRange.min && p.price < priceRange.max);

    // Style tag filter
    if (selectedStyles.length > 0) {
      result = result.filter(p => 
        p.tags?.some(tag => selectedStyles.includes(tag.toLowerCase()))
      );
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      result = result.filter(p => 
        p.materials?.some(m => selectedMaterials.some(sm => m.toLowerCase().includes(sm)))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        break;
    }

    return result;
  }, [products, selectedCategory, selectedPriceRange, searchQuery, selectedStyles, selectedMaterials, sortBy]);

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(0);
    setSelectedStyles([]);
    setSelectedMaterials([]);
    setSearchQuery('');
    setSortBy('newest');
    setSearchParams({});
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev => prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]);
  };

  const hasActiveFilters = selectedCategory || selectedPriceRange > 0 || searchQuery.trim() || selectedStyles.length > 0 || selectedMaterials.length > 0;

  return (
    <Layout>
      <SEOHead title="Shop Furniture" description="Browse our curated collection of high-quality furniture. Filter by style, material, price, and more." />
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              {selectedCategory 
                ? collections.find(c => c.slug === selectedCategory)?.name || 'Shop All'
                : 'Shop All Furniture'
              }
            </h1>
            <p className="mt-2 text-muted-foreground">
              {loading ? 'Loading...' : `${filteredProducts.length} products`}
            </p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
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

              {/* Style Tags */}
              <div>
                <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
                  Style
                </h3>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((style) => (
                    <Badge
                      key={style}
                      variant={selectedStyles.includes(style) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleStyle(style)}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider">
                  Material
                </h3>
                <div className="flex flex-wrap gap-2">
                  {materialOptions.map((material) => (
                    <Badge
                      key={material}
                      variant={selectedMaterials.includes(material) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleMaterial(material)}
                    >
                      {material}
                    </Badge>
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
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
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

        {/* Recently Viewed */}
        <RecentlyViewedSection />
      </div>
    </Layout>
  );
};

export default Catalog;
