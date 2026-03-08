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
      webhookSigningSecret?: string;
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

    let event: Stripe.Event;

    // Verify webhook signature if signing secret is configured
    if (signature && stripeSettings.webhookSigningSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, stripeSettings.webhookSigningSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Webhook signature verification failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Update order status to confirmed + paid
          await supabase
            .from("orders")
            .update({
              status: "confirmed",
              payment_status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", orderId);

          console.log(`Order ${orderId} marked as confirmed/paid`);

          // Trigger order confirmation email
          try {
            await supabase.functions.invoke("send-order-email", {
              body: { orderId, type: "order_confirmation" },
            });
          } catch (emailErr) {
            console.error("Failed to send confirmation email:", emailErr);
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "cancelled", payment_status: "unpaid" })
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
