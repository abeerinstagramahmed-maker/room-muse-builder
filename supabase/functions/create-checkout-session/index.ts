import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get Stripe secret key from store_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "stripe")
      .single();

    if (settingsError || !settingsData) {
      return new Response(
        JSON.stringify({ error: "Stripe settings not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSettings = settingsData.value as {
      enabled: boolean;
      testMode: boolean;
      secretKey: string;
      publishableKey: string;
    };

    if (!stripeSettings.enabled) {
      return new Response(
        JSON.stringify({ error: "Stripe payments are not enabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stripeSettings.secretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured. Please add it in Admin Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSettings.secretKey, {
      apiVersion: "2023-10-16",
    });

    const { orderId, items, successUrl, cancelUrl } = await req.json();

    if (!orderId || !items || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, items, successUrl, cancelUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build line items for Stripe
    const lineItems = items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${successUrl}?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        order_id: orderId,
      },
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
