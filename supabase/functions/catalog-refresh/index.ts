import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FURNITURE_CATEGORIES = [
  { query: 'modern sofa', category: 'sofas' },
  { query: 'dining table wood', category: 'tables' },
  { query: 'accent chair living room', category: 'chairs' },
  { query: 'bed frame modern', category: 'beds' },
  { query: 'bookshelf storage', category: 'storage' },
  { query: 'coffee table', category: 'tables' },
  { query: 'desk home office', category: 'desks' },
  { query: 'nightstand bedroom', category: 'storage' },
  { query: 'floor lamp modern', category: 'lighting' },
  { query: 'area rug living room', category: 'decor' },
];

const SCRAPE_TARGETS = [
  { name: 'Wayfair', url: 'https://www.wayfair.com/keyword.php?keyword=', selector: 'product' },
  { name: 'West Elm', url: 'https://www.westelm.com/search/results.html?words=', selector: 'product' },
  { name: 'IKEA', url: 'https://www.ikea.com/us/en/search/?q=', selector: 'product' },
];

interface ScrapedProduct {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  purchaseLink: string;
  storeSource: string;
  category: string;
  materials?: string[];
  tags?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { categories, stores, limit = 5, dryRun = false } = body;

    // Load store settings
    const { data: settings } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store')
      .single();

    const storeConfig = settings?.value as any;
    const markup = (storeConfig?.productMarkup || 5) / 100;
    const firecrawlApiKey = storeConfig?.firecrawlApiKey;

    // Determine which categories to refresh
    const targetCategories = categories?.length
      ? FURNITURE_CATEGORIES.filter(c => categories.includes(c.category))
      : FURNITURE_CATEGORIES;

    // Determine which stores to scrape
    const targetStores = stores?.length
      ? SCRAPE_TARGETS.filter(s => stores.includes(s.name))
      : SCRAPE_TARGETS;

    const results: { inserted: number; updated: number; errors: string[]; products: ScrapedProduct[] } = {
      inserted: 0,
      updated: 0,
      errors: [],
      products: [],
    };

    // If Firecrawl is configured, attempt real scraping
    if (firecrawlApiKey) {
      console.log('[catalog-refresh] Firecrawl API key found, attempting real scrape...');

      for (const store of targetStores) {
        for (const cat of targetCategories.slice(0, limit)) {
          try {
            const searchUrl = `${store.url}${encodeURIComponent(cat.query)}`;
            console.log(`[catalog-refresh] Scraping ${store.name}: ${cat.query}`);

            const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${firecrawlApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: searchUrl,
                formats: [
                  {
                    type: 'json',
                    schema: {
                      type: 'object',
                      properties: {
                        products: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              price: { type: 'number' },
                              originalPrice: { type: 'number' },
                              description: { type: 'string' },
                              imageUrl: { type: 'string' },
                              link: { type: 'string' },
                              materials: { type: 'array', items: { type: 'string' } },
                            },
                          },
                        },
                      },
                    },
                    prompt: `Extract up to ${limit} furniture products from this page. For each product get: name, price (number only), originalPrice if on sale, a brief description, the main image URL, the product page link, and materials if listed.`,
                  },
                ],
                waitFor: 3000,
              }),
            });

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json();
              const extractedProducts = scrapeData?.data?.json?.products || scrapeData?.json?.products || [];

              for (const p of extractedProducts.slice(0, limit)) {
                if (!p.name || !p.price) continue;
                results.products.push({
                  name: p.name,
                  price: Math.round(p.price * (1 + markup) * 100) / 100,
                  originalPrice: p.price,
                  description: p.description || `${p.name} from ${store.name}`,
                  imageUrl: p.imageUrl || '',
                  purchaseLink: p.link || searchUrl,
                  storeSource: store.name,
                  category: cat.category,
                  materials: p.materials || [],
                  tags: ['scraped', cat.category],
                });
              }
            } else {
              const errText = await scrapeResponse.text();
              results.errors.push(`${store.name}/${cat.query}: ${scrapeResponse.status} - ${errText.slice(0, 200)}`);
            }
          } catch (err) {
            results.errors.push(`${store.name}/${cat.query}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
      }
    } else {
      // Mock mode — generate sample products for each category/store combo
      console.log('[catalog-refresh] No Firecrawl key — running in mock mode');

      for (const store of targetStores) {
        for (const cat of targetCategories.slice(0, limit)) {
          const basePrice = 150 + Math.random() * 800;
          results.products.push({
            name: `${cat.query.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} — ${store.name}`,
            price: Math.round(basePrice * (1 + markup) * 100) / 100,
            originalPrice: Math.round(basePrice * 100) / 100,
            description: `High-quality ${cat.query} sourced from ${store.name}. Auto-imported by catalog refresh.`,
            imageUrl: `https://placehold.co/600x600/E8E0D8/4A4A4A?text=${encodeURIComponent(cat.query)}`,
            purchaseLink: `${store.url}${encodeURIComponent(cat.query)}`,
            storeSource: store.name,
            category: cat.category,
            materials: ['wood', 'metal', 'fabric'].slice(0, Math.floor(Math.random() * 3) + 1),
            tags: ['scraped', 'auto-import', cat.category],
          });
        }
      }
    }

    // Upsert products into the database (unless dry run)
    if (!dryRun && results.products.length > 0) {
      for (const product of results.products) {
        // Check for existing product by name + store_source to avoid duplicates
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('name', product.name)
          .eq('store_source', product.storeSource)
          .maybeSingle();

        const productRow = {
          name: product.name,
          price: product.price,
          original_price: product.originalPrice || null,
          description: product.description,
          images: product.imageUrl ? [product.imageUrl] : [],
          purchase_link: product.purchaseLink,
          store_source: product.storeSource,
          category: product.category,
          materials: product.materials || [],
          tags: product.tags || [],
          vendor: product.storeSource,
          in_stock: true,
          commission_percent: storeConfig?.defaultCommission || 15,
        };

        if (existing) {
          const { error } = await supabase
            .from('products')
            .update(productRow)
            .eq('id', existing.id);
          if (error) {
            results.errors.push(`Update ${product.name}: ${error.message}`);
          } else {
            results.updated++;
          }
        } else {
          const { error } = await supabase
            .from('products')
            .insert(productRow);
          if (error) {
            results.errors.push(`Insert ${product.name}: ${error.message}`);
          } else {
            results.inserted++;
          }
        }
      }
    }

    // Log refresh event into store_settings
    const refreshLog = {
      lastRun: new Date().toISOString(),
      productsFound: results.products.length,
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors.length,
      mode: firecrawlApiKey ? 'live' : 'mock',
    };

    await supabase
      .from('store_settings')
      .upsert({
        key: 'catalog_refresh_log',
        value: refreshLog,
      }, { onConflict: 'key' });

    console.log(`[catalog-refresh] Done. Found: ${results.products.length}, Inserted: ${results.inserted}, Updated: ${results.updated}, Errors: ${results.errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        ...refreshLog,
        dryRun,
        errors: results.errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[catalog-refresh] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
