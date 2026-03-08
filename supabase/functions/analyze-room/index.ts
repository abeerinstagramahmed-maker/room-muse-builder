import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * DEPRECATED: This edge function previously used the Lovable AI Gateway (Gemini 2.5 Pro).
 * It has been replaced by the modular AI pipeline:
 *   - analyze-room-image (room understanding)
 *   - detect-furniture (object detection)
 *   - generate-room-design (image generation)
 *   - recommend-products (product matching)
 * 
 * This stub remains for backward compatibility but redirects to the new pipeline.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: 'This endpoint has been deprecated. Please use the new modular AI pipeline.',
      migration: {
        analyzeRoom: 'analyze-room-image',
        detectFurniture: 'detect-furniture',
        generateDesign: 'generate-room-design',
        recommendProducts: 'recommend-products',
      },
    }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
