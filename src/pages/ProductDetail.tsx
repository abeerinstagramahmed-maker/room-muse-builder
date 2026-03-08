import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Star, Truck, RotateCcw, Shield, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewedSection } from '@/components/product/RecentlyViewedSection';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { ReviewSection } from '@/components/product/ReviewSection';
import { SEOHead } from '@/components/SEOHead';
import { Product } from '@/lib/types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, loading, getProductById } = useProducts();
  const { addItem } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setProductLoading(true);
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
        setSelectedColor(fetchedProduct?.colors?.[0]);
        if (fetchedProduct) addToRecentlyViewed(fetchedProduct.id);
        setProductLoading(false);
      }
    };
    loadProduct();
  }, [id, getProductById, addToRecentlyViewed]);

  if (productLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="mb-6 h-6 w-24" />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-24">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Link to="/catalog" className="mt-4">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Layout>
      <SEOHead 
        title={product.name} 
        description={product.description || `Shop ${product.name} at Roomly`}
        type="product"
      />
      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/"><Home className="h-4 w-4" /></Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/catalog">Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/catalog?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {product.category}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors",
                      selectedImage === index ? "border-primary" : "border-transparent"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-amber-500" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 text-muted-foreground">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-sm font-medium">
                  Color: <span className="text-muted-foreground">{selectedColor}</span>
                </h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "rounded-lg border-2 px-4 py-2 text-sm transition-colors",
                        selectedColor === color
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-8">
              <Button
                size="xl"
                variant="hero"
                className="w-full gap-2 md:w-auto"
                onClick={() => addItem(product, 1, selectedColor)}
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="mt-8 grid gap-4 rounded-xl bg-muted/50 p-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-muted-foreground">Orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">30-Day Returns</p>
                  <p className="text-muted-foreground">Easy refunds</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">2-Year Warranty</p>
                  <p className="text-muted-foreground">Full coverage</p>
                </div>
              </div>
            </div>

            {/* Specs */}
            {(product.dimensions || product.materials) && (
              <div className="mt-8">
                <h3 className="mb-4 font-display text-lg font-semibold">Specifications</h3>
                <dl className="space-y-2 text-sm">
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Dimensions</dt>
                      <dd>
                        {product.dimensions.width}W × {product.dimensions.height}H × {product.dimensions.depth}D cm
                      </dd>
                    </div>
                  )}
                  {product.materials && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Materials</dt>
                      <dd>{product.materials.join(', ')}</dd>
                    </div>
                  )}
                  {/* Vendor info hidden for white-label experience */}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 font-display text-2xl font-bold">You May Also Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewedSection />
      </div>
    </Layout>
  );
};

export default ProductDetail;
