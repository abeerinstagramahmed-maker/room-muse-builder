import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Deterministic (non-LLM) furniture placement suggestions.
 * Given a detected room type + dimensions, pick essential furniture archetypes,
 * match them to real catalog products, and compute floor positions.
 */
const ROOM_PLANS: Record<string, { category: string; keywords: string[]; rel: [number, number] }[]> = {
  "living room": [
    { category: "sofa", keywords: ["sofa", "couch", "sectional"], rel: [0, -0.35] },
    { category: "coffee table", keywords: ["coffee table", "table"], rel: [0, 0] },
    { category: "tv stand", keywords: ["tv stand", "media", "console"], rel: [0, 0.4] },
    { category: "armchair", keywords: ["armchair", "accent chair", "chair"], rel: [-0.35, 0] },
    { category: "rug", keywords: ["rug"], rel: [0, 0] },
  ],
  bedroom: [
    { category: "bed", keywords: ["bed"], rel: [0, -0.3] },
    { category: "nightstand", keywords: ["nightstand", "bedside"], rel: [-0.3, -0.3] },
    { category: "dresser", keywords: ["dresser", "drawers"], rel: [0.35, 0.35] },
    { category: "lamp", keywords: ["lamp"], rel: [0.3, -0.3] },
  ],
  "home office": [
    { category: "desk", keywords: ["desk"], rel: [0, -0.3] },
    { category: "office chair", keywords: ["office chair", "chair"], rel: [0, -0.1] },
    { category: "bookshelf", keywords: ["bookshelf", "shelf", "bookcase"], rel: [0.4, 0] },
  ],
  "dining room": [
    { category: "dining table", keywords: ["dining table", "table"], rel: [0, 0] },
    { category: "dining chair", keywords: ["dining chair", "chair"], rel: [0, -0.2] },
    { category: "sideboard", keywords: ["sideboard", "buffet", "cabinet"], rel: [0, 0.4] },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const roomType: string = (body.roomType || "living room").toLowerCase();
    const width: number = Number(body.width) || 15;
    const depth: number = Number(body.depth) || 20;

    const plan = ROOM_PLANS[roomType] || ROOM_PLANS["living room"];

    // Load in-stock products once.
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, category, subcategory, price, image_url, width, depth, height, in_stock")
      .eq("in_stock", true)
      .limit(500);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const all = products || [];
    const used = new Set<string>();
    const suggestions = plan.map((slot) => {
      const match = all.find((p) => {
        if (used.has(p.id)) return false;
        const hay = `${p.name} ${p.category} ${p.subcategory ?? ""}`.toLowerCase();
        return slot.keywords.some((k) => hay.includes(k));
      });
      if (!match) return null;
      used.add(match.id);
      const x = +(slot.rel[0] * width).toFixed(2);
      const z = +(slot.rel[1] * depth).toFixed(2);
      return {
        slot: slot.category,
        productId: match.id,
        name: match.name,
        imageUrl: match.image_url,
        price: match.price,
        size: [match.width || 3, match.height || 2.5, match.depth || 3],
        position: [x, 0, z],
        reason: `Recommended ${slot.category} for your ${roomType}, sized to fit the space.`,
      };
    }).filter(Boolean);

    return new Response(
      JSON.stringify({ success: true, suggestions }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("[suggest-furniture] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
