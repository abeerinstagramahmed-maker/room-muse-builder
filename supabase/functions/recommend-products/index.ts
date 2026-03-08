import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const budgetRanges: Record<string, { min: number; max: number }> = {
  budget: { min: 0, max: 2000 },
  mid: { min: 500, max: 5000 },
  luxury: { min: 2000, max: 50000 },
};

const COMMISSION_RATE = 0.05;
const MIN_RATING = 4.0;
const MIN_REVIEW_COUNT = 0; // Relaxed for dev; set to 50 for production

// Style compatibility matrix — how well each product tag matches a room style
const styleCompatibility: Record<string, string[]> = {
  modern: ['modern', 'minimalist', 'contemporary', 'sleek', 'clean'],
  scandinavian: ['scandinavian', 'nordic', 'minimalist', 'hygge', 'natural', 'light'],
  industrial: ['industrial', 'loft', 'raw', 'metal', 'urban', 'rustic'],
  bohemian: ['bohemian', 'boho', 'eclectic', 'global', 'colorful', 'layered'],
  traditional: ['traditional', 'classic', 'elegant', 'timeless', 'formal'],
  coastal: ['coastal', 'beach', 'nautical', 'natural', 'light', 'airy'],
};

const preferredMaterials: Record<string, string[]> = {
  modern: ['metal', 'glass', 'leather', 'engineered wood'],
  scandinavian: ['solid wood', 'birch', 'oak', 'wool', 'linen', 'cotton'],
  industrial: ['metal', 'iron', 'steel', 'reclaimed wood', 'concrete', 'leather'],
  bohemian: ['rattan', 'wicker', 'cotton', 'jute', 'macrame', 'velvet'],
  traditional: ['solid wood', 'mahogany', 'walnut', 'silk', 'velvet', 'leather'],
  coastal: ['rattan', 'wicker', 'linen', 'cotton', 'driftwood', 'bamboo'],
};

// Category aliases to match furniture plan types to product categories
const categoryAliases: Record<string, string[]> = {
  sofa: ['sofa', 'couch', 'sectional', 'loveseat', 'seating'],
  'coffee table': ['coffee table', 'center table', 'tables'],
  'side table': ['side table', 'end table', 'accent table', 'tables'],
  'floor lamp': ['floor lamp', 'lamp', 'lighting'],
  'pendant light': ['pendant', 'chandelier', 'lighting'],
  bookshelf: ['bookshelf', 'shelf', 'shelving', 'storage'],
  'accent chair': ['accent chair', 'armchair', 'chair', 'seating'],
  'area rug': ['rug', 'carpet', 'flooring'],
  'dining table': ['dining table', 'table', 'tables'],
  'dining chair': ['dining chair', 'chair', 'seating'],
  bed: ['bed', 'bedroom'],
  dresser: ['dresser', 'chest', 'storage'],
  nightstand: ['nightstand', 'bedside table', 'tables'],
  desk: ['desk', 'office', 'tables'],
  'office chair': ['office chair', 'chair', 'seating'],
  ottoman: ['ottoman', 'pouf', 'footstool', 'seating'],
  console: ['console table', 'console', 'tables'],
  mirror: ['mirror', 'decor'],
  'woven pouf': ['pouf', 'ottoman', 'seating'],
};

interface ScoringWeights {
  style: number;
  budget: number;
  quality: number;
  material: number;
  fit: number;
}

const weights: ScoringWeights = {
  style: 0.30,
  budget: 0.20,
  quality: 0.20,
  material: 0.15,
  fit: 0.15,
};

function computeStyleScore(productTags: string[], productCategory: string, roomStyle: string): number {
  const compatTags = styleCompatibility[roomStyle] || styleCompatibility.modern;
  const allTags = [...(productTags || []).map(t => t.toLowerCase()), productCategory.toLowerCase()];
  const matches = compatTags.filter(tag => allTags.some(pt => pt.includes(tag) || tag.includes(pt)));
  return Math.min(matches.length / Math.max(compatTags.length * 0.3, 1), 1);
}

function computeBudgetScore(price: number, budgetRange: { min: number; max: number }): number {
  const midpoint = (budgetRange.min + budgetRange.max) / 2;
  const range = budgetRange.max - budgetRange.min;
  if (range === 0) return price <= midpoint ? 1 : 0;
  const distance = Math.abs(price - midpoint) / (range / 2);
  return Math.max(0, 1 - distance * 0.5);
}

function computeQualityScore(rating: number | null, reviewCount: number | null): number {
  const r = rating ?? 0;
  const rc = reviewCount ?? 0;
  const ratingScore = r / 5;
  const reviewScore = Math.min(rc / 200, 1); // 200+ reviews = max
  return ratingScore * 0.7 + reviewScore * 0.3;
}

function computeMaterialScore(productMaterials: string[], roomStyle: string): number {
  const preferred = preferredMaterials[roomStyle] || [];
  if (preferred.length === 0 || productMaterials.length === 0) return 0.5;
  const matches = preferred.filter(m => 
    productMaterials.some(pm => pm.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(pm.toLowerCase()))
  );
  return Math.min(matches.length / Math.max(preferred.length * 0.2, 1), 1);
}

function computeFitScore(
  productDimensions: any,
  furnitureType: string,
  roomArea: number
): number {
  // Without real room dimensions, use heuristic based on room area estimate
  if (!productDimensions) return 0.6; // neutral if no dimensions
  const { width, height, depth } = productDimensions;
  if (!width && !depth) return 0.6;
  
  const productFootprint = (width || 50) * (depth || 50); // cm²
  const roomAreaCm2 = roomArea * 929; // sq ft to cm² roughly
  const ratio = productFootprint / roomAreaCm2;
  
  // Furniture should take reasonable portion of room
  if (ratio < 0.001) return 0.4; // too small
  if (ratio > 0.15) return 0.3; // too large
  return 0.8 + (0.2 * (1 - Math.abs(ratio - 0.05) / 0.1));
}

function matchesCategory(productCategory: string, furnitureType: string): boolean {
  const normalizedProduct = productCategory.toLowerCase();
  const normalizedFurniture = furnitureType.toLowerCase();
  
  // Direct match
  if (normalizedProduct.includes(normalizedFurniture) || normalizedFurniture.includes(normalizedProduct)) {
    return true;
  }
  
  // Check aliases
  const aliases = categoryAliases[normalizedFurniture] || [normalizedFurniture];
  return aliases.some(alias => 
    normalizedProduct.includes(alias) || alias.includes(normalizedProduct)
  );
}

/**
 * recommend-products
 * 
 * Enhanced product recommendation with multi-factor scoring.
 * Filters by style, category, budget, quality, and room fit.
 * Scores and ranks to return top N products per furniture type.
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

    // ── Furniture Plan Mode ──
    if (planOnly) {
      console.log('[recommend-products] Generating furniture plan for style:', style);

      const furnitureByStyle: Record<string, any[]> = {
        modern: [
          { type: 'sofa', placement: 'center wall', reason: 'Anchors the seating area with clean lines', priority: 'must-have' },
          { type: 'coffee table', placement: 'in front of sofa', reason: 'Functional surface for the seating area', priority: 'must-have' },
          { type: 'floor lamp', placement: 'corner by sofa', reason: 'Ambient lighting with sculptural form', priority: 'nice-to-have' },
          { type: 'side table', placement: 'beside sofa', reason: 'Convenient surface for drinks', priority: 'nice-to-have' },
          { type: 'area rug', placement: 'under seating area', reason: 'Defines the conversation zone', priority: 'nice-to-have' },
        ],
        scandinavian: [
          { type: 'sofa', placement: 'facing window', reason: 'Maximize natural light enjoyment', priority: 'must-have' },
          { type: 'coffee table', placement: 'center', reason: 'Light wood adds warmth', priority: 'must-have' },
          { type: 'bookshelf', placement: 'side wall', reason: 'Storage with display potential', priority: 'nice-to-have' },
          { type: 'floor lamp', placement: 'reading corner', reason: 'Warm ambient lighting', priority: 'nice-to-have' },
        ],
        industrial: [
          { type: 'sofa', placement: 'center', reason: 'Industrial aesthetic anchor in leather', priority: 'must-have' },
          { type: 'coffee table', placement: 'center', reason: 'Raw material complement in metal/wood', priority: 'must-have' },
          { type: 'pendant light', placement: 'overhead', reason: 'Industrial focal point', priority: 'nice-to-have' },
          { type: 'bookshelf', placement: 'against wall', reason: 'Metal and wood shelving unit', priority: 'nice-to-have' },
        ],
        bohemian: [
          { type: 'sofa', placement: 'L-shape corner', reason: 'Cozy gathering spot with colorful textiles', priority: 'must-have' },
          { type: 'woven pouf', placement: 'beside sofa', reason: 'Flexible seating option', priority: 'nice-to-have' },
          { type: 'area rug', placement: 'under seating area', reason: 'Layer pattern and color', priority: 'must-have' },
          { type: 'floor lamp', placement: 'corner', reason: 'Warm bohemian glow', priority: 'nice-to-have' },
        ],
        traditional: [
          { type: 'sofa', placement: 'facing fireplace', reason: 'Classic focal arrangement', priority: 'must-have' },
          { type: 'accent chair', placement: 'flanking sofa', reason: 'Symmetrical balance', priority: 'must-have' },
          { type: 'coffee table', placement: 'center', reason: 'Classic wood centerpiece', priority: 'must-have' },
          { type: 'console', placement: 'behind sofa', reason: 'Display and storage', priority: 'nice-to-have' },
        ],
        coastal: [
          { type: 'sofa', placement: 'facing window', reason: 'Ocean view orientation', priority: 'must-have' },
          { type: 'coffee table', placement: 'center', reason: 'Natural texture element', priority: 'must-have' },
          { type: 'accent chair', placement: 'beside window', reason: 'Reading nook by the light', priority: 'nice-to-have' },
          { type: 'area rug', placement: 'under seating area', reason: 'Natural fiber grounding', priority: 'nice-to-have' },
        ],
      };

      const plan = {
        roomStyle: style,
        budget,
        recommendedFurniture: furnitureByStyle[style] || furnitureByStyle.modern,
        removalSuggestions: roomAnalysis?.detectedFurniture?.length > 0
          ? [`Consider replacing ${roomAnalysis.detectedFurniture.map((f: any) => f.label || f).join(', ')} to match the ${style} aesthetic`]
          : ['Room appears empty — perfect canvas for a fresh design'],
      };

      return new Response(
        JSON.stringify(plan),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Product Recommendation Mode ──
    console.log('[recommend-products] Enhanced recommendation for style:', style, 'budget:', budget);

    const range = budgetRanges[budget] || budgetRanges.mid;
    const furnitureTypes = furniturePlan?.recommendedFurniture?.map((f: any) => f.type) || [];
    const roomArea = 300; // Default room area estimate in sq ft; will come from analyze-room-image

    // Fetch a broad set of products
    const { data: rawProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, category, subcategory, price, original_price, tags, rating, review_count, materials, dimensions, images, vendor, in_stock, colors')
      .eq('in_stock', true)
      .gte('price', range.min * 0.1) // individual item can be 10% of total budget min
      .lte('price', range.max * 0.6) // individual item shouldn't exceed 60% of max
      .limit(100);

    if (dbError) {
      console.error('[recommend-products] DB error:', dbError);
      throw new Error('Failed to fetch products');
    }

    const products = rawProducts || [];
    console.log(`[recommend-products] Fetched ${products.length} candidate products`);

    // Score each product against each furniture type
    const recommendations: any[] = [];
    const usedProductIds = new Set<string>();

    for (const furnitureType of furnitureTypes) {
      const candidates = products
        .filter((p: any) => {
          // Category match
          if (!matchesCategory(p.category, furnitureType)) return false;
          // Quality filter
          if ((p.rating ?? 0) < MIN_RATING && (p.review_count ?? 0) > MIN_REVIEW_COUNT) return false;
          // Not already recommended
          if (usedProductIds.has(p.id)) return false;
          return true;
        })
        .map((p: any) => {
          const styleScore = computeStyleScore(p.tags || [], p.category, style);
          const budgetScore = computeBudgetScore(p.price, range);
          const qualityScore = computeQualityScore(p.rating, p.review_count);
          const materialScore = computeMaterialScore(p.materials || [], style);
          const fitScore = computeFitScore(p.dimensions, furnitureType, roomArea);

          const totalScore = 
            weights.style * styleScore +
            weights.budget * budgetScore +
            weights.quality * qualityScore +
            weights.material * materialScore +
            weights.fit * fitScore;

          return {
            product: p,
            scores: { styleScore, budgetScore, qualityScore, materialScore, fitScore },
            totalScore,
            furnitureType,
          };
        })
        .sort((a: any, b: any) => b.totalScore - a.totalScore);

      // Take top 1 per furniture type (or top 2 for must-have items)
      const planItem = furniturePlan?.recommendedFurniture?.find((f: any) => f.type === furnitureType);
      const topN = planItem?.priority === 'must-have' ? 1 : 1;

      for (const candidate of candidates.slice(0, topN)) {
        usedProductIds.add(candidate.product.id);
        const p = candidate.product;
        const commissionPrice = Math.round(p.price * (1 + COMMISSION_RATE) * 100) / 100;

        recommendations.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          commissionPrice,
          image: p.images?.[0] || '',
          storeSource: p.vendor,
          purchaseLink: `/product/${p.id}`,
          category: p.category,
          styleTags: p.tags || [],
          rating: p.rating ?? 0,
          reviewCount: p.review_count ?? 0,
          material: (p.materials || []).join(', ') || 'Not specified',
          dimensions: p.dimensions,
          colors: p.colors || [],
          matchScore: Math.round(candidate.totalScore * 100) / 100,
          scoreBreakdown: candidate.scores,
          furnitureType: candidate.furnitureType,
          placement: planItem?.placement || 'flexible',
          reason: `${p.name} scores ${Math.round(candidate.totalScore * 100)}% match for your ${style} ${furnitureType}. ${
            candidate.scores.styleScore > 0.7 ? 'Excellent style fit. ' : ''
          }${candidate.scores.qualityScore > 0.7 ? 'Highly rated. ' : ''
          }${candidate.scores.materialScore > 0.7 ? 'Premium materials. ' : ''}`,
        });
      }
    }

    // If we didn't find enough, fill with top-scored remaining products
    if (recommendations.length < 3 && products.length > 0) {
      const remaining = products
        .filter((p: any) => !usedProductIds.has(p.id))
        .map((p: any) => {
          const totalScore = 
            weights.style * computeStyleScore(p.tags || [], p.category, style) +
            weights.budget * computeBudgetScore(p.price, range) +
            weights.quality * computeQualityScore(p.rating, p.review_count);
          return { product: p, totalScore };
        })
        .sort((a: any, b: any) => b.totalScore - a.totalScore)
        .slice(0, 5 - recommendations.length);

      for (const item of remaining) {
        const p = item.product;
        recommendations.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          commissionPrice: Math.round(p.price * (1 + COMMISSION_RATE) * 100) / 100,
          image: p.images?.[0] || '',
          storeSource: p.vendor,
          purchaseLink: `/product/${p.id}`,
          category: p.category,
          styleTags: p.tags || [],
          rating: p.rating ?? 0,
          reviewCount: p.review_count ?? 0,
          material: (p.materials || []).join(', ') || 'Not specified',
          dimensions: p.dimensions,
          colors: p.colors || [],
          matchScore: Math.round(item.totalScore * 100) / 100,
          furnitureType: 'complementary',
          placement: 'flexible',
          reason: `${p.name} complements your ${style} design and fits within your ${budget} budget.`,
        });
      }
    }

    console.log(`[recommend-products] Returning ${recommendations.length} scored recommendations`);

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
