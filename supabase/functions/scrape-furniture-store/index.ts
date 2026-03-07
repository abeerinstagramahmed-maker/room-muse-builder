import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPPORTED_STORES = [
  { name: 'Wayfair', domain: 'wayfair.com', searchUrl: 'https://www.wayfair.com/keyword.php?keyword=' },
  { name: 'West Elm', domain: 'westelm.com', searchUrl: 'https://www.westelm.com/search/results.html?words=' },
  { name: 'Pottery Barn', domain: 'potterybarn.com', searchUrl: 'https://www.potterybarn.com/search/results.html?words=' },
  { name: 'Crate & Barrel', domain: 'crateandbarrel.com', searchUrl: 'https://www.crateandbarrel.com/search?query=' },
  { name: 'CB2', domain: 'cb2.com', searchUrl: 'https://www.cb2.com/search?query=' },
];

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

    // Get store settings for Firecrawl API key and markup
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store')
      .single();

    const storeConfig = settings?.value as any;
    const firecrawlApiKey = storeConfig?.firecrawlApiKey;
    const markup = (storeConfig?.productMarkup || 5) / 100;

    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Firecrawl API key not configured. Please add it in Admin Settings > Product Sourcing.',
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search URL
    const targetStore = store 
      ? SUPPORTED_STORES.find(s => s.domain.includes(store)) 
      : SUPPORTED_STORES[0]; // Default to Wayfair

    if (!targetStore) {
      return new Response(
        JSON.stringify({ error: 'Unsupported store', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchUrl = targetStore.searchUrl + encodeURIComponent(searchQuery);
    console.log('Scraping:', targetStore.name, 'URL:', searchUrl);

    // Use Firecrawl to scrape the search results
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ['markdown', 'links'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!scrapeResponse.ok) {
      const errText = await scrapeResponse.text();
      console.error('Firecrawl error:', scrapeResponse.status, errText);

      if (scrapeResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Firecrawl credits exhausted. Please top up your Firecrawl account.', success: false }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Firecrawl API error: ${scrapeResponse.status}`);
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const links = scrapeData.data?.links || scrapeData.links || [];

    // Use AI to extract product data from scraped content
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a product data extractor. Extract furniture product information from scraped web content.
Return a JSON array of products. Each product should have:
- name: Product name
- price: Original price as a number (no currency symbol)
- category: Best fitting category (living-room, bedroom, dining, office, outdoor, lighting, decor)
- description: Short description
- imageUrl: Product image URL if found
- sourceUrl: Product page URL if found
- vendor: "${targetStore.name}"

Only include real products with actual prices. Max ${limit} products.
Return ONLY valid JSON array, no markdown.`
          },
          {
            role: 'user',
            content: `Extract product data from this ${targetStore.name} search results for "${searchQuery}":\n\n${markdown.slice(0, 8000)}\n\nAvailable links: ${JSON.stringify(links.slice(0, 50))}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';

    let products;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      products = JSON.parse((jsonMatch[1] || content).trim());
    } catch {
      console.error('Failed to parse AI product extraction:', content);
      products = [];
    }

    // Apply markup to all products
    const markedUpProducts = (Array.isArray(products) ? products : []).map((p: any) => ({
      ...p,
      originalPrice: p.price,
      price: Math.round(p.price * (1 + markup) * 100) / 100,
      markup: markup * 100,
      vendor: targetStore.name,
    }));

    console.log(`Extracted ${markedUpProducts.length} products from ${targetStore.name}`);

    return new Response(
      JSON.stringify({
        success: true,
        products: markedUpProducts,
        store: targetStore.name,
        searchQuery,
        totalFound: markedUpProducts.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-furniture-store:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
