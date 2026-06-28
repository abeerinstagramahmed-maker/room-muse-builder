import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default LLaVA 1.6 (Vicuna 13B) vision model on Replicate.
const DEFAULT_MODEL_VERSION =
  "yorickvp/llava-v1.6-vicuna-13b:0603dec596080fa084e26f0ae6d605fc5788ed2b1a0358cd25010619487eae63";

const ANALYSIS_PROMPT = `You are an expert interior designer analyzing a photo of a room.
Respond with ONLY a single JSON object (no markdown, no prose) with these exact keys:
{
  "room_type": "living room | bedroom | home office | dining room | kitchen | bathroom | other",
  "estimated_width": number (feet),
  "estimated_depth": number (feet),
  "estimated_height": number (feet),
  "wall_color": "a hex color like #E8E4DD",
  "floor_type": "hardwood | carpet | tile | laminate | concrete | other",
  "detected_furniture": ["sofa", "coffee table", ...],
  "style_suggestions": ["Scandinavian", "Mid-Century Modern", ...],
  "lighting_conditions": "bright natural | warm ambient | dim | mixed"
}`;

interface ReplicateSettings {
  apiKey?: string;
  model?: string;
}

function safeParseAnalysis(raw: string) {
  const fallback = {
    room_type: "living room",
    estimated_width: 15,
    estimated_depth: 20,
    estimated_height: 9,
    wall_color: "#E8E4DD",
    floor_type: "hardwood",
    detected_furniture: [] as string[],
    style_suggestions: ["Modern", "Scandinavian"],
    lighting_conditions: "mixed",
  };
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const parsed = JSON.parse(match[0]);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate the caller.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const imageUrl: string | undefined = body.imageUrl;
    const imageBase64: string | undefined = body.imageBase64;
    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageUrl or imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Resolve Replicate token: admin AI settings first, then env fallback.
    const { data: aiData } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "ai_settings")
      .maybeSingle();

    const aiSettings = (aiData?.value || {}) as {
      providers?: { replicate?: ReplicateSettings };
    };
    const replicate = aiSettings.providers?.replicate || {};
    const token = replicate.apiKey || Deno.env.get("REPLICATE_API_TOKEN");
    const modelVersion = replicate.model || DEFAULT_MODEL_VERSION;

    if (!token) {
      return new Response(
        JSON.stringify({
          error:
            "Replicate API key not configured. Add it in Admin → Settings → AI.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const image = imageUrl || imageBase64;

    // Create the prediction.
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion.includes(":")
          ? modelVersion.split(":")[1]
          : modelVersion,
        input: { image, prompt: ANALYSIS_PROMPT, max_tokens: 512, temperature: 0.1 },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("[analyze-room] Replicate create error:", errText);
      return new Response(
        JSON.stringify({ error: "AI provider error", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let prediction = await createRes.json();

    // Poll for completion (up to ~60s).
    const started = Date.now();
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled" &&
      Date.now() - started < 60000
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      prediction = await pollRes.json();
    }

    if (prediction.status !== "succeeded") {
      console.error("[analyze-room] Prediction did not succeed:", prediction.status, prediction.error);
      return new Response(
        JSON.stringify({ error: "Room analysis failed", detail: prediction.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const output = Array.isArray(prediction.output)
      ? prediction.output.join("")
      : String(prediction.output ?? "");

    const analysis = safeParseAnalysis(output);

    // Persist the analysis.
    const { data: saved, error: insertError } = await supabaseAdmin
      .from("room_analyses")
      .insert({
        user_id: user.id,
        image_url: imageUrl || "uploaded",
        room_type: analysis.room_type,
        estimated_width: analysis.estimated_width,
        estimated_depth: analysis.estimated_depth,
        estimated_height: analysis.estimated_height,
        wall_color: analysis.wall_color,
        floor_type: analysis.floor_type,
        detected_furniture: analysis.detected_furniture,
        style_suggestions: analysis.style_suggestions,
        lighting_conditions: analysis.lighting_conditions,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[analyze-room] Insert error:", insertError.message);
    }

    return new Response(
      JSON.stringify({ success: true, analysis: saved || analysis }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("[analyze-room] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
