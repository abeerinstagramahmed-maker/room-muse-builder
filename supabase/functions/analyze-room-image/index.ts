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
      const retryAfter = parseInt(res.headers.get('retry-after') || '10', 10);
      console.log(`[analyze-room-image] Rate limited, retrying in ${retryAfter}s (attempt ${attempt + 1}/${maxRetries})`);
      await res.text(); // consume body
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Replicate API error: ${res.status} ${body}`);
    }

    let prediction = await res.json();
    const deadline = Date.now() + 120_000;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
      if (Date.now() > deadline) throw new Error('Replicate prediction timed out');
      await new Promise(r => setTimeout(r, 1500));
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

    const apiKey = await getReplicateKey();

    if (!apiKey) {
      console.log('[analyze-room-image] No Replicate key — running mock analysis');
      return new Response(JSON.stringify(mockAnalysis()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[analyze-room-image] Running BLIP-2 + LLaVA analysis via Replicate');

    const imageUri = `data:image/jpeg;base64,${imageBase64}`;

    let caption = '';
    let analysis: any = null;

    try {
      // Step 1: BLIP-2 caption
      const blipOutput = await runReplicate(
        apiKey,
        'a28e30f7d3879e3474e5d5cdcfde4788cc0a5822d30bd0b6c8a25ee82f9a4e83',
        { image: imageUri, question: 'Describe this room in detail including furniture, colors, lighting, and layout.' },
      );
      caption = typeof blipOutput === 'string' ? blipOutput : (blipOutput || '');
    } catch (e) {
      console.warn('[analyze-room-image] BLIP-2 failed, continuing with LLaVA only:', e);
    }

    try {
      // Step 2: LLaVA structured analysis
      const llavaPrompt = `You are an interior design analyst. Analyze this room image and return ONLY a valid JSON object with these exact keys:
{
  "roomType": "living-room|bedroom|dining-room|office|kitchen|bathroom",
  "description": "2-3 sentence description",
  "lighting": "description of lighting conditions",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "layoutNotes": "layout analysis including approximate dimensions and flow"
}
${caption ? `Additional context from image caption: "${caption}"` : ''}
Return ONLY the JSON, no markdown or explanation.`;

      const llavaOutput = await runReplicate(
        apiKey,
        '2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591',
        { image: imageUri, prompt: llavaPrompt, max_tokens: 1024, temperature: 0.1 },
      );

      const llavaText = Array.isArray(llavaOutput) ? llavaOutput.join('') : String(llavaOutput);
      try {
        const jsonMatch = llavaText.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        analysis = null;
      }
    } catch (e) {
      console.warn('[analyze-room-image] LLaVA failed:', e);
    }

    // If both AI calls failed, return mock data
    if (!caption && !analysis) {
      console.log('[analyze-room-image] Both AI models failed — returning mock analysis');
      return new Response(JSON.stringify(mockAnalysis()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = {
      roomType: analysis?.roomType || 'living-room',
      description: analysis?.description || caption || 'A room with furniture.',
      detectedFurniture: [],
      lighting: analysis?.lighting || 'Mixed natural and artificial lighting',
      colorPalette: analysis?.colorPalette || ['#F5F0EB', '#D4C5B2', '#8B7355', '#4A4A4A', '#FFFFFF'],
      layoutNotes: analysis?.layoutNotes || 'Open layout with standard proportions.',
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[analyze-room-image] Error:', error);
    // Graceful fallback to mock on any unhandled error
    console.log('[analyze-room-image] Returning mock analysis as fallback');
    return new Response(JSON.stringify(mockAnalysis()), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mockAnalysis() {
  const roomTypes = ['living-room', 'bedroom', 'dining-room', 'office', 'kitchen'];
  const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
  return {
    roomType: randomRoomType,
    description: `A spacious ${randomRoomType.replace('-', ' ')} with natural lighting from large windows. The space features neutral-toned walls and hardwood flooring.`,
    detectedFurniture: [],
    lighting: 'Natural light from west-facing windows, supplemented by overhead fixtures',
    colorPalette: ['#F5F0EB', '#D4C5B2', '#8B7355', '#4A4A4A', '#FFFFFF'],
    layoutNotes: 'The room has an open floor plan with approximately 300 sq ft of usable space.',
  };
}