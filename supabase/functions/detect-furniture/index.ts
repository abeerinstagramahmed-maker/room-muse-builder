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

async function runReplicate(apiKey: string, model: string, input: Record<string, unknown>): Promise<any> {
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: model, input }),
  });
  if (!res.ok) throw new Error(`Replicate API error: ${res.status} ${await res.text()}`);
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

/**
 * detect-furniture
 *
 * Real mode: Grounding DINO for bounding boxes + optional SAM 2 for segmentation masks
 * Mock mode: returns realistic detection results when no API key is set
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, useSAM = false, targetObjects = [] } = await req.json();
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = await getReplicateKey();

    if (!apiKey) {
      console.log('[detect-furniture] No Replicate key — running mock detection');
      return new Response(JSON.stringify({ success: true, objects: mockObjects() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[detect-furniture] Running Grounding DINO via Replicate');

    const imageUri = `data:image/jpeg;base64,${imageBase64}`;

    // Grounding DINO — detect furniture objects
    const dinoOutput = await runReplicate(
      apiKey,
      'b26e3944e5710f39bea1bdd0cd23a2b4d54c5a45c83d1a85f907d09ba1fe3f37', // ShilongLiu/grounding-dino
      {
        image: imageUri,
        prompt: 'sofa . chair . table . lamp . shelf . bed . desk . rug . cabinet . bookshelf . dresser . mirror . ottoman . stool',
        box_threshold: 0.3,
        text_threshold: 0.25,
      },
    );

    // Parse DINO output — returns { labels: string[], boxes: number[][] }
    const labels: string[] = dinoOutput?.labels || [];
    const boxes: number[][] = dinoOutput?.boxes || [];

    const categoryMap: Record<string, string> = {
      sofa: 'seating', chair: 'seating', ottoman: 'seating', stool: 'seating',
      table: 'tables', desk: 'tables',
      lamp: 'lighting',
      shelf: 'storage', bookshelf: 'storage', cabinet: 'storage', dresser: 'storage',
      bed: 'bedroom',
      rug: 'decor', mirror: 'decor',
    };

    let objects = labels.map((label: string, i: number) => {
      const box = boxes[i] || [0, 0, 100, 100];
      const cleanLabel = label.replace(/\s*\([\d.]+\)\s*$/, '').trim().toLowerCase();
      return {
        label: cleanLabel,
        confidence: parseFloat(label.match(/\(([\d.]+)\)/)?.[1] || '0.8'),
        boundingBox: {
          x: Math.round(box[0]),
          y: Math.round(box[1]),
          width: Math.round(box[2] - box[0]),
          height: Math.round(box[3] - box[1]),
        },
        category: categoryMap[cleanLabel] || 'furniture',
      };
    });

    // Optional: Run SAM 2 for segmentation masks on specific objects
    if (useSAM && targetObjects.length > 0 && objects.length > 0) {
      console.log('[detect-furniture] Running SAM 2 for segmentation on', targetObjects.length, 'targets');
      
      // Filter objects that match target labels
      const targetsToSegment = objects.filter(obj =>
        targetObjects.some((t: string) => obj.label.includes(t.toLowerCase()))
      );

      for (const obj of targetsToSegment) {
        try {
          const samOutput = await runReplicate(
            apiKey,
            'fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65571ac8ec23571e', // meta/sam-2
            {
              image: imageUri,
              point_coords: `${obj.boundingBox.x + obj.boundingBox.width / 2},${obj.boundingBox.y + obj.boundingBox.height / 2}`,
              point_labels: '1',
            },
          );
          if (samOutput) {
            (obj as any).mask = typeof samOutput === 'string' ? samOutput : samOutput[0];
          }
        } catch (e) {
          console.warn(`[detect-furniture] SAM failed for ${obj.label}:`, e);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, objects }),
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

function mockObjects() {
  return [
    { label: 'sofa', confidence: 0.95, boundingBox: { x: 40, y: 180, width: 320, height: 160 }, category: 'seating' },
    { label: 'coffee table', confidence: 0.89, boundingBox: { x: 140, y: 340, width: 140, height: 90 }, category: 'tables' },
    { label: 'bookshelf', confidence: 0.82, boundingBox: { x: 420, y: 50, width: 100, height: 280 }, category: 'storage' },
    { label: 'floor lamp', confidence: 0.76, boundingBox: { x: 380, y: 80, width: 50, height: 220 }, category: 'lighting' },
    { label: 'area rug', confidence: 0.71, boundingBox: { x: 60, y: 320, width: 350, height: 120 }, category: 'decor' },
  ];
}
