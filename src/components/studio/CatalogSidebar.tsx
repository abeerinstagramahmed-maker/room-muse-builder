import { useMemo, useState } from 'react';
import { Search, Package, Loader2, Box } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useStudioProducts, productSize, StudioProduct } from '@/hooks/useStudioProducts';
import { PRODUCT_CATEGORIES, mountTypeForCategory } from '@/lib/studioConstants';
import { useStudioStore } from '@/stores/studioStore';
import { cn } from '@/lib/utils';

export function CatalogSidebar() {
  const { data: products = [], isLoading } = useStudioProducts();
  const addFurniture = useStudioStore((s) => s.addFurniture);
  const room = useStudioStore((s) => s.room);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = !category || p.category === category;
      const matchesSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, search, category]);

  const handleAdd = (p: StudioProduct) => {
    const mountType = mountTypeForCategory(p.category);
    if (mountType === 'wall') {
      const [w, h] = productSize(p);
      addFurniture({
        productId: p.id,
        name: p.name,
        modelUrl: p.modelUrl,
        // Thin depth so it sits flat against the wall.
        size: [w, h, 0.15],
        position: [0, Math.max(2.5, room.height * 0.55), -(room.depth / 2 - 0.12)],
        rotationY: 0,
        scale: 1,
        mountType: 'wall',
      });
      return;
    }
    addFurniture({
      productId: p.id,
      name: p.name,
      modelUrl: p.modelUrl,
      size: productSize(p),
      position: [0, 0, 0],
      rotationY: 0,
      scale: 1,
      mountType: 'floor',
    });
  };


  return (
    <aside className="flex h-full w-72 flex-col border-r bg-card">
      <div className="border-b p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4" /> Product Catalog
        </h2>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-8"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs transition-colors',
              !category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70',
            )}
          >
            All
          </button>
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                category === c.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/70',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-2 p-3">
          {isLoading && (
            <div className="col-span-2 flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">
              No products found.
            </p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAdd(p)}
              className="group flex flex-col overflow-hidden rounded-lg border bg-background text-left transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Box className="h-8 w-8" />
                  </div>
                )}
                {!p.modelUrl && (
                  <Badge variant="secondary" className="absolute right-1 top-1 text-[10px]">
                    No 3D
                  </Badge>
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-1 text-xs font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">${p.price.toFixed(0)}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
