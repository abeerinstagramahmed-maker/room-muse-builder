import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * detect-furniture
 * 
 * Purpose: Detect furniture objects with bounding boxes.
 * Target Model: Grounding DINO + Segment Anything (SAM) via Replicate
 * Current Mode: MOCK — returns realistic detection results.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: When Replicate API key is configured, call:
    // - Grounding DINO for object detection + bounding boxes
    // - SAM for precise segmentation masks

    console.log('[detect-furniture] Running mock detection...');

    const mockObjects = [
      { label: 'sofa', confidence: 0.95, boundingBox: { x: 40, y: 180, width: 320, height: 160 }, category: 'seating' },
      { label: 'coffee table', confidence: 0.89, boundingBox: { x: 140, y: 340, width: 140, height: 90 }, category: 'tables' },
      { label: 'bookshelf', confidence: 0.82, boundingBox: { x: 420, y: 50, width: 100, height: 280 }, category: 'storage' },
      { label: 'floor lamp', confidence: 0.76, boundingBox: { x: 380, y: 80, width: 50, height: 220 }, category: 'lighting' },
      { label: 'area rug', confidence: 0.71, boundingBox: { x: 60, y: 320, width: 350, height: 120 }, category: 'decor' },
    ];

    return new Response(
      JSON.stringify({ success: true, objects: mockObjects }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[detect-furniture] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
