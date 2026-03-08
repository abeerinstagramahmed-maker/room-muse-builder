import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('in_stock', true);

    const baseUrl = req.headers.get('origin') || 'https://room-muse-builder.lovable.app';

    const staticRoutes = [
      { loc: '/', priority: '1.0' },
      { loc: '/catalog', priority: '0.9' },
      { loc: '/designer', priority: '0.8' },
      { loc: '/pricing', priority: '0.7' },
      { loc: '/faq', priority: '0.5' },
      { loc: '/contact', priority: '0.5' },
      { loc: '/shipping', priority: '0.4' },
      { loc: '/returns', priority: '0.4' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const route of staticRoutes) {
      xml += `
  <url>
    <loc>${baseUrl}${route.loc}</loc>
    <priority>${route.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`;
    }

    if (products) {
      for (const product of products) {
        xml += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${new Date(product.updated_at).toISOString().split('T')[0]}</lastmod>
    <priority>0.6</priority>
    <changefreq>weekly</changefreq>
  </url>`;
      }
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
