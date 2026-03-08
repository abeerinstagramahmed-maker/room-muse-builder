import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from 'react-i18next';

const Compare = () => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();
  const { t } = useTranslation();

  if (compareProducts.length === 0) {
    return (
      <Layout>
        <SEOHead title={t('compare.title')} />
        <div className="container flex flex-col items-center justify-center py-24">
          <h1 className="font-display text-3xl font-bold">{t('compare.empty')}</h1>
          <p className="mt-2 text-muted-foreground">{t('compare.emptyDesc')}</p>
          <Link to="/catalog">
            <Button className="mt-6">{t('catalog.title')}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const specs = [
    { label: t('compare.price'), render: (p: typeof compareProducts[0]) => `$${p.price.toLocaleString()}` },
    { label: t('compare.rating'), render: (p: typeof compareProducts[0]) => `${p.rating} ⭐` },
    { label: t('compare.category'), render: (p: typeof compareProducts[0]) => p.category },
    { label: t('compare.vendor'), render: (p: typeof compareProducts[0]) => p.vendor },
    { label: t('compare.materials'), render: (p: typeof compareProducts[0]) => p.materials?.join(', ') || '—' },
    { label: t('compare.inStock'), render: (p: typeof compareProducts[0]) => p.inStock ? t('compare.yes') : t('compare.no') },
  ];

  return (
    <Layout>
      <SEOHead title={t('compare.title')} />
      <div className="container py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">{t('compare.title')}</h1>
            <p className="mt-1 text-muted-foreground">{t('compare.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={clearCompare}>{t('compare.removeAll')}</Button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Product headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
              <div />
              {compareProducts.map(product => (
                <Card key={product.id} className="relative overflow-hidden">
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                  </Link>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
                    <Button size="sm" className="mt-2 w-full gap-1 text-xs" onClick={() => addItem(product)}>
                      <ShoppingBag className="h-3 w-3" />
                      {t('catalog.addToCart')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Spec rows */}
            <div className="mt-4 space-y-0">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className="grid items-center gap-4 border-b border-border py-3"
                  style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}
                >
                  <span className="text-sm font-medium text-muted-foreground">{spec.label}</span>
                  {compareProducts.map(product => (
                    <span key={product.id} className="text-sm font-medium">{spec.render(product)}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Compare;
