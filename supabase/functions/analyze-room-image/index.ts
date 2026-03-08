import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * analyze-room-image
 * 
 * Purpose: Understand room layout, detect room type, generate description.
 * Target Model: BLIP-2 or LLaVA via Replicate
 * Current Mode: MOCK — returns realistic mock data for development.
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
    // - Replicate BLIP-2 for room description
    // - Replicate LLaVA for detailed analysis
    // For now, return mock analysis

    console.log('[analyze-room-image] Running mock analysis...');

    const roomTypes = ['living-room', 'bedroom', 'dining-room', 'office', 'kitchen'];
    const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

    const mockAnalysis = {
      roomType: randomRoomType,
      description: `A spacious ${randomRoomType.replace('-', ' ')} with natural lighting from large windows. The space features neutral-toned walls and hardwood flooring, providing a versatile base for various design styles.`,
      detectedFurniture: [
        { label: 'sofa', confidence: 0.92, boundingBox: { x: 50, y: 200, width: 300, height: 150 }, category: 'seating' },
        { label: 'coffee table', confidence: 0.87, boundingBox: { x: 150, y: 350, width: 120, height: 80 }, category: 'tables' },
        { label: 'floor lamp', confidence: 0.78, boundingBox: { x: 400, y: 100, width: 40, height: 200 }, category: 'lighting' },
      ],
      lighting: 'Natural light from west-facing windows, supplemented by overhead fixtures',
      colorPalette: ['#F5F0EB', '#D4C5B2', '#8B7355', '#4A4A4A', '#FFFFFF'],
      layoutNotes: 'The room has an open floor plan with approximately 300 sq ft of usable space. The main seating area is oriented toward the window wall, with good flow paths on both sides.',
    };

    return new Response(
      JSON.stringify(mockAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[analyze-room-image] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
