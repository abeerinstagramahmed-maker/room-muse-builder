import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Product } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export const RecentlyViewedSection = () => {
  const { getProductsByIds } = useProducts();
  const { getRecentlyViewed } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const ids = getRecentlyViewed();
    if (ids.length > 0) {
      getProductsByIds(ids.slice(0, 4)).then(setProducts);
    }
  }, [getRecentlyViewed, getProductsByIds]);

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 font-display text-2xl font-bold">{t('catalog.recentlyViewed')}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
