import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPPORTED_STORES = [
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'Etsy', domain: 'etsy.com' },
  { name: 'IKEA', domain: 'ikea.com' },
  { name: 'Wayfair', domain: 'wayfair.com' },
  { name: 'West Elm', domain: 'westelm.com' },
  { name: 'Pottery Barn', domain: 'potterybarn.com' },
  { name: 'Crate & Barrel', domain: 'crateandbarrel.com' },
];

/**
 * scrape-furniture-products
 * 
 * Purpose: Collect products from multiple furniture stores.
 * Uses: Firecrawl for scraping + LLM for extraction.
 * Current Mode: MOCK — returns sample product data.
 * 
 * Product structure includes commission pricing for marketplace model.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery, store, category, limit = 10 } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'searchQuery is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get store settings for markup
    const { data: settings } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store')
      .single();

    const storeConfig = settings?.value as any;
    const markup = (storeConfig?.productMarkup || 5) / 100;

    const targetStore = store
      ? SUPPORTED_STORES.find(s => s.domain.includes(store))
      : SUPPORTED_STORES[0];

    if (!targetStore) {
      return new Response(
        JSON.stringify({ error: 'Unsupported store', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scrape-furniture-products] Mock scrape from ${targetStore.name} for "${searchQuery}"`);

    // TODO: When Firecrawl + LLM APIs are configured:
    // 1. Scrape search results from target store using Firecrawl
    // 2. Extract product data using LLM
    // 3. Apply markup pricing

    // Mock products
    const mockProducts = Array.from({ length: Math.min(limit, 5) }, (_, i) => {
      const basePrice = 100 + Math.random() * 900;
      return {
        id: `scrape-${targetStore.domain}-${Date.now()}-${i}`,
        name: `${searchQuery} - ${targetStore.name} Pick #${i + 1}`,
        price: Math.round(basePrice * (1 + markup) * 100) / 100,
        originalPrice: Math.round(basePrice * 100) / 100,
        commissionPrice: Math.round(basePrice * (1 + markup) * 100) / 100,
        image: `https://placehold.co/400x400/E8E0D8/4A4A4A?text=${encodeURIComponent(searchQuery)}`,
        storeSource: targetStore.name,
        purchaseLink: `https://${targetStore.domain}/search?q=${encodeURIComponent(searchQuery)}`,
        category: category || 'furniture',
        styleTags: ['modern', 'contemporary'],
        markup: markup * 100,
        vendor: targetStore.name,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        products: mockProducts,
        store: targetStore.name,
        searchQuery,
        totalFound: mockProducts.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[scrape-furniture-products] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
