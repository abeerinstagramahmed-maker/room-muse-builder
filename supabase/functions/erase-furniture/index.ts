import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default LaMa object-removal / cleanup model on Replicate.
// (Configurable via Admin AI settings -> providers.replicate.eraseModel)
const DEFAULT_ERASE_MODEL =
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
    const image: string | undefined = body.imageUrl || body.imageBase64;
    if (!image) {
      return new Response(
        JSON.stringify({ error: "imageUrl or imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: aiData } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "ai_settings")
      .maybeSingle();
    const aiSettings = (aiData?.value || {}) as {
      providers?: { replicate?: { apiKey?: string; eraseModel?: string } };
    };
    const replicate = aiSettings.providers?.replicate || {};
    const token = replicate.apiKey || Deno.env.get("REPLICATE_API_TOKEN");
    const modelVersion = replicate.eraseModel || DEFAULT_ERASE_MODEL;

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Replicate API key not configured. Add it in Admin → Settings → AI.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        version: modelVersion.includes(":") ? modelVersion.split(":")[1] : modelVersion,
        input: { image },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("[erase-furniture] Replicate create error:", errText);
      return new Response(
        JSON.stringify({ error: "AI provider error", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let prediction = await createRes.json();
    const started = Date.now();
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled" &&
      Date.now() - started < 90000
    ) {
      await new Promise((r) => setTimeout(r, 2500));
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      prediction = await pollRes.json();
    }

    if (prediction.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Furniture removal failed", detail: prediction.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanedUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    return new Response(
      JSON.stringify({ success: true, cleanedImageUrl: cleanedUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("[erase-furniture] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
