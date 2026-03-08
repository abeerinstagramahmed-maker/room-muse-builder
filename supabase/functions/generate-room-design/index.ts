import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * generate-room-design
 * 
 * Purpose: Generate a redesigned room image preserving room structure.
 * Target Model: Stable Diffusion XL (SDXL) + ControlNet (Depth/Canny) via Replicate
 * Current Mode: MOCK — returns a placeholder generated image URL.
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

    // TODO: When Replicate API key is configured, call:
    // 1. Depth estimation model to get depth map from room image
    // 2. SDXL + ControlNet (depth) to generate redesigned room
    // Prompt built from: style + furniturePlan + roomAnalysis

    console.log('[generate-room-design] Running mock generation for style:', style);

    const stylePrompts: Record<string, string> = {
      modern: 'A modern minimalist living room with clean lines, neutral palette, sleek furniture',
      scandinavian: 'A Scandinavian hygge room with light woods, cozy textiles, warm lighting',
      industrial: 'An industrial loft space with exposed brick, metal accents, raw materials',
      bohemian: 'A bohemian eclectic room with layered textiles, warm colors, global patterns',
      traditional: 'A traditional elegant room with classic furniture, rich fabrics, timeless details',
      coastal: 'A coastal-inspired room with light colors, natural textures, ocean palette',
    };

    const prompt = stylePrompts[style] || `A beautifully designed ${style} room`;

    const mockResult = {
      imageUrl: `https://placehold.co/800x600/F5F0EB/4A4A4A?text=AI+Generated+${encodeURIComponent(style)}+Room`,
      prompt,
      controlNetType: 'depth' as const,
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
