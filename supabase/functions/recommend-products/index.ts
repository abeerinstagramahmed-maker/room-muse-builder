import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const budgetRanges: Record<string, { min: number; max: number }> = {
  budget: { min: 0, max: 2000 },
  mid: { min: 2000, max: 5000 },
  luxury: { min: 5000, max: 50000 },
};

/**
 * recommend-products
 * 
 * Purpose: Match furniture plan to real purchasable products from the catalog.
 * Target Model: GPT-4o mini or Claude Haiku for intelligent matching.
 * Current Mode: MOCK — matches products from DB by category and price range.
 * 
 * Also handles `planOnly: true` to generate a furniture placement plan.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { style, budget, planOnly, furniturePlan, roomAnalysis } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If planOnly, return a furniture placement plan (mock)
    if (planOnly) {
      console.log('[recommend-products] Generating mock furniture plan for style:', style);

      const furnitureByStyle: Record<string, any[]> = {
        modern: [
          { type: 'sofa', placement: 'center wall', reason: 'Anchors the seating area', priority: 'must-have' },
          { type: 'coffee table', placement: 'in front of sofa', reason: 'Functional surface for the seating area', priority: 'must-have' },
          { type: 'floor lamp', placement: 'corner by sofa', reason: 'Ambient lighting for evenings', priority: 'nice-to-have' },
          { type: 'side table', placement: 'beside sofa', reason: 'Convenient surface for drinks', priority: 'nice-to-have' },
        ],
        scandinavian: [
          { type: 'sofa', placement: 'facing window', reason: 'Maximize natural light enjoyment', priority: 'must-have' },
          { type: 'wooden coffee table', placement: 'center', reason: 'Light wood adds warmth', priority: 'must-have' },
          { type: 'bookshelf', placement: 'side wall', reason: 'Storage with display potential', priority: 'nice-to-have' },
        ],
        industrial: [
          { type: 'leather sofa', placement: 'center', reason: 'Industrial aesthetic anchor', priority: 'must-have' },
          { type: 'metal coffee table', placement: 'center', reason: 'Raw material complement', priority: 'must-have' },
          { type: 'pendant light', placement: 'overhead', reason: 'Industrial focal point', priority: 'nice-to-have' },
        ],
        bohemian: [
          { type: 'sectional sofa', placement: 'L-shape corner', reason: 'Cozy gathering spot', priority: 'must-have' },
          { type: 'woven pouf', placement: 'beside sofa', reason: 'Flexible seating option', priority: 'nice-to-have' },
          { type: 'area rug', placement: 'under seating area', reason: 'Layer pattern and color', priority: 'must-have' },
        ],
        traditional: [
          { type: 'tufted sofa', placement: 'facing fireplace', reason: 'Classic focal arrangement', priority: 'must-have' },
          { type: 'accent chair', placement: 'flanking sofa', reason: 'Symmetrical balance', priority: 'must-have' },
          { type: 'console table', placement: 'behind sofa', reason: 'Display and storage', priority: 'nice-to-have' },
        ],
        coastal: [
          { type: 'linen sofa', placement: 'facing window', reason: 'Ocean view orientation', priority: 'must-have' },
          { type: 'driftwood coffee table', placement: 'center', reason: 'Natural texture element', priority: 'must-have' },
          { type: 'wicker basket', placement: 'beside sofa', reason: 'Natural storage solution', priority: 'nice-to-have' },
        ],
      };

      const plan = {
        roomStyle: style,
        budget,
        recommendedFurniture: furnitureByStyle[style] || furnitureByStyle.modern,
        removalSuggestions: ['Consider removing outdated items that clash with the new style'],
      };

      return new Response(
        JSON.stringify(plan),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Product recommendation mode
    console.log('[recommend-products] Fetching products for style:', style, 'budget:', budget);

    const range = budgetRanges[budget] || budgetRanges.mid;

    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, name, category, price, tags')
      .eq('in_stock', true)
      .gte('price', range.min / 5) // individual item price
      .lte('price', range.max / 2)
      .limit(20);

    if (dbError) {
      console.error('[recommend-products] DB error:', dbError);
      throw new Error('Failed to fetch products');
    }

    // TODO: When LLM API is configured, use GPT-4o mini / Claude Haiku to:
    // 1. Score each product against the furniture plan
    // 2. Rank by style compatibility + budget fit
    // For now, simple scoring

    const recommendations = (products || []).slice(0, 5).map((p: any, i: number) => ({
      productId: p.id,
      matchScore: 0.95 - (i * 0.05),
      reason: `${p.name} complements the ${style} aesthetic and fits within your ${budget} budget.`,
    }));

    return new Response(
      JSON.stringify({ success: true, recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[recommend-products] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
