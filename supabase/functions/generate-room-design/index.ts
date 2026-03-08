import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * generate-room-design
 * 
 * Purpose: Generate a redesigned room image preserving room structure,
 * with product placement overlay data.
 * 
 * Target Model: SDXL + ControlNet (Depth/Canny) via Replicate
 * Current Mode: MOCK — returns placeholder + placement map.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, style, budget, roomAnalysis, furniturePlan } = await req.json();

    if (!imageBase64 || !style) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 and style are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-room-design] Generating design for style:', style);

    const stylePrompts: Record<string, string> = {
      modern: 'A modern minimalist living room with clean lines, neutral palette, sleek furniture',
      scandinavian: 'A Scandinavian hygge room with light woods, cozy textiles, warm lighting',
      industrial: 'An industrial loft space with exposed brick, metal accents, raw materials',
      bohemian: 'A bohemian eclectic room with layered textiles, warm colors, global patterns',
      traditional: 'A traditional elegant room with classic furniture, rich fabrics, timeless details',
      coastal: 'A coastal-inspired room with light colors, natural textures, ocean palette',
    };

    const prompt = stylePrompts[style] || `A beautifully designed ${style} room`;

    // Build placement map from furniture plan
    const placementPlan = (furniturePlan?.recommendedFurniture || []).map((item: any, index: number) => {
      // Mock placement coordinates based on furniture type
      const placements: Record<string, { x: number; y: number; scale: number }> = {
        sofa: { x: 0.3, y: 0.6, scale: 0.35 },
        'coffee table': { x: 0.45, y: 0.7, scale: 0.15 },
        'floor lamp': { x: 0.1, y: 0.3, scale: 0.12 },
        'side table': { x: 0.7, y: 0.55, scale: 0.1 },
        bookshelf: { x: 0.85, y: 0.4, scale: 0.2 },
        'accent chair': { x: 0.65, y: 0.55, scale: 0.18 },
        'area rug': { x: 0.4, y: 0.75, scale: 0.4 },
        'pendant light': { x: 0.45, y: 0.1, scale: 0.12 },
        'woven pouf': { x: 0.6, y: 0.7, scale: 0.08 },
        console: { x: 0.5, y: 0.45, scale: 0.2 },
      };

      const pos = placements[item.type] || { x: 0.5, y: 0.5, scale: 0.15 };

      return {
        type: item.type,
        placement: item.placement,
        position: pos,
        layer: index,
        shadow: true,
        perspective: 'front',
      };
    });

    // TODO: When Replicate API key is configured:
    // 1. Run depth estimation on input image
    // 2. Build ControlNet conditioning from depth map
    // 3. Generate with SDXL + ControlNet (depth/canny)
    // 4. For product placement overlay:
    //    a. Get product cutout images (transparent PNG)
    //    b. Scale based on perspective and room geometry
    //    c. Composite onto generated image with shadows

    const mockResult = {
      imageUrl: `https://placehold.co/800x600/F5F0EB/4A4A4A?text=AI+Generated+${encodeURIComponent(style)}+Room`,
      prompt,
      controlNetType: 'depth' as const,
      placementPlan,
      compositeMethod: 'mock', // 'controlnet' | 'direct-composite' | 'mock'
      metadata: {
        roomType: roomAnalysis?.roomType || 'living-room',
        detectedItemCount: roomAnalysis?.detectedFurniture?.length || 0,
        placedItemCount: placementPlan.length,
        styleApplied: style,
        budgetTier: budget,
      },
    };

    return new Response(
      JSON.stringify(mockResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-room-design] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
