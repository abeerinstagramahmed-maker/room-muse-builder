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
        JSON.stringify({ error: "Stripe settings not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSettings = settingsData.value as {
      enabled: boolean;
      secretKey: string;
    };

    if (!stripeSettings.secretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSettings.secretKey, {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // If webhook signing secret is configured, verify signature
    // For now, we parse the event directly since the signing secret
    // can be configured later in admin settings
    let event: Stripe.Event;

    if (signature) {
      // TODO: Add webhook signing secret to store_settings for production
      // For now, construct the event from the body
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Update order status to paid
          await supabase
            .from("orders")
            .update({
              status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", orderId);

          console.log(`Order ${orderId} marked as paid`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId);

          console.log(`Order ${orderId} cancelled (session expired)`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
