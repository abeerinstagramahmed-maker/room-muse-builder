import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery, category } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'searchQuery is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get store settings for Amazon API keys and markup
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store')
      .single();

    const storeConfig = settings?.value as any;
    const amazonApiKey = storeConfig?.amazonApiKey;
    const amazonApiSecret = storeConfig?.amazonApiSecret;
    const amazonAssociateTag = storeConfig?.amazonAssociateTag;
    const markup = (storeConfig?.productMarkup || 5) / 100;

    if (!amazonApiKey || !amazonApiSecret || !amazonAssociateTag) {
      return new Response(
        JSON.stringify({ 
          error: 'Amazon API credentials not configured. Please add them in Admin Settings > Product Sourcing.',
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: Amazon Product Advertising API v5 requires signed requests
    // This is a placeholder structure - actual implementation requires AWS Signature V4
    console.log('Amazon Product API search:', searchQuery, 'category:', category);
    console.log('Markup:', markup * 100, '%');

    // For now, return a structured response indicating the API is ready to be connected
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Amazon API credentials configured. Product fetch will be available once AWS Signature V4 signing is implemented.',
        markup: markup * 100,
        searchQuery,
        category,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-amazon-products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
