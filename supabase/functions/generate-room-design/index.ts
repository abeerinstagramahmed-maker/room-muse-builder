import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function getReplicateKey(): Promise<string | null> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'ai_settings')
    .maybeSingle();
  return (data?.value as any)?.replicateApiKey || null;
}

async function runReplicate(apiKey: string, model: string, input: Record<string, unknown>, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: model, input }),
    });

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') || '15', 10);
      console.log(`[generate-room-design] Rate limited, retrying in ${retryAfter}s (attempt ${attempt + 1}/${maxRetries})`);
      await res.text();
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Replicate API error: ${res.status} ${body}`);
    }

    let prediction = await res.json();
    const deadline = Date.now() + 180_000;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
      if (Date.now() > deadline) throw new Error('Replicate prediction timed out');
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(prediction.urls.get, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      prediction = await poll.json();
    }
    if (prediction.status === 'failed') throw new Error(prediction.error || 'Prediction failed');
    return prediction.output;
  }
  throw new Error('Replicate API: max retries exceeded (rate limited)');
}

const stylePrompts: Record<string, string> = {
  modern: 'A modern minimalist interior with clean lines, neutral palette, sleek low-profile furniture, concrete and glass accents, architectural lighting',
  scandinavian: 'A Scandinavian hygge interior with light oak furniture, white walls, cozy wool textiles, warm ambient lighting, plants and natural materials',
  industrial: 'An industrial loft interior with exposed brick walls, metal pipe shelving, raw wood tables, Edison bulb lighting, weathered leather seating',
  bohemian: 'A bohemian eclectic interior with layered colorful textiles, rattan and wicker furniture, macrame wall hangings, warm earthy tones, plants everywhere',
  traditional: 'A traditional elegant interior with classic carved wood furniture, rich velvet upholstery, ornate mirror, warm ambient chandelier lighting',
  coastal: 'A coastal beach-inspired interior with white and blue palette, rattan furniture, natural linen textiles, driftwood accents, light airy curtains',
};

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

    const apiKey = await getReplicateKey();
    const prompt = stylePrompts[style] || `A beautifully designed ${style} interior`;
    const placementPlan = buildPlacementPlan(furniturePlan);

    if (!apiKey) {
      console.log('[generate-room-design] No Replicate key — returning mock design');
      return new Response(JSON.stringify(mockDesign(style, budget, roomAnalysis, placementPlan, prompt)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[generate-room-design] Running MiDaS + SDXL ControlNet via Replicate for style:', style);

    const imageUri = `data:image/jpeg;base64,${imageBase64}`;

    try {
      // Step 1: MiDaS depth estimation
      console.log('[generate-room-design] Step 1: MiDaS depth estimation');
      const depthOutput = await runReplicate(
        apiKey,
        '3bd03ef8e70e777243b5e91f839eda29624aab8df78da20e03e8e21f43eedc31',
        { image: imageUri, model_type: 'DPT_Large' },
      );
      const depthMapUrl = typeof depthOutput === 'string' ? depthOutput : depthOutput?.[0] || depthOutput;

      // Step 2: SDXL + ControlNet Depth
      console.log('[generate-room-design] Step 2: SDXL + ControlNet Depth generation');
      const sdxlOutput = await runReplicate(
        apiKey,
        '252e2da55b75b756c37c3eb37ffd2cbf15e54c96d14cb5ced56dbc65e6c3a28d',
        {
          image: depthMapUrl,
          prompt: `${prompt}, professional interior photography, 8k, high quality, photorealistic, well-lit`,
          negative_prompt: 'low quality, blurry, distorted, watermark, text, ugly, deformed, cartoon, anime, painting',
          num_inference_steps: 30,
          guidance_scale: 7.5,
          controlnet_conditioning_scale: 0.7,
          seed: Math.floor(Math.random() * 1000000),
        },
      );

      const generatedUrl = Array.isArray(sdxlOutput) ? sdxlOutput[0] : sdxlOutput;

      return new Response(JSON.stringify({
        imageUrl: generatedUrl,
        prompt,
        controlNetType: 'depth',
        placementPlan,
        compositeMethod: 'controlnet-depth',
        metadata: {
          roomType: roomAnalysis?.roomType || 'living-room',
          detectedItemCount: roomAnalysis?.detectedFurniture?.length || 0,
          placedItemCount: placementPlan.length,
          styleApplied: style,
          budgetTier: budget,
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (e) {
      console.warn('[generate-room-design] AI generation failed, returning mock:', e);
      return new Response(JSON.stringify(mockDesign(style, budget, roomAnalysis, placementPlan, prompt)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('[generate-room-design] Error:', error);
    return new Response(JSON.stringify(mockDesign('modern', 'mid', null, [], 'A modern interior')), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mockDesign(style: string, budget: string, roomAnalysis: any, placementPlan: any[], prompt: string) {
  return {
    imageUrl: `https://placehold.co/800x600/F5F0EB/4A4A4A?text=AI+Generated+${encodeURIComponent(style)}+Room`,
    prompt,
    controlNetType: 'depth',
    placementPlan,
    compositeMethod: 'mock',
    metadata: {
      roomType: roomAnalysis?.roomType || 'living-room',
      detectedItemCount: roomAnalysis?.detectedFurniture?.length || 0,
      placedItemCount: placementPlan.length,
      styleApplied: style,
      budgetTier: budget,
    },
  };
}

function buildPlacementPlan(furniturePlan: any) {
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

  return (furniturePlan?.recommendedFurniture || []).map((item: any, index: number) => {
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
}