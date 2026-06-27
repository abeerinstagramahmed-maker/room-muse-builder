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

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        // active/trialing => pro active; past_due => past_due; otherwise reflect status.
        const isActive = sub.status === "active" || sub.status === "trialing";
        const update = {
          plan: isActive ? "pro" : sub.status === "past_due" ? "pro" : "free",
          status: sub.status === "past_due" ? "past_due" : isActive ? "active" : sub.status,
          current_period_end: periodEnd,
          stripe_subscription_id: sub.id,
        };
        if (userId) {
          await supabase.from("subscriptions").update(update).eq("user_id", userId);
        } else {
          await supabase
            .from("subscriptions")
            .update(update)
            .eq("stripe_customer_id", sub.customer as string);
        }
        console.log(`Subscription ${sub.id} ${event.type} -> ${update.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        const update = { plan: "free", status: "cancelled" };
        if (userId) {
          await supabase.from("subscriptions").update(update).eq("user_id", userId);
        } else {
          await supabase
            .from("subscriptions")
            .update(update)
            .eq("stripe_customer_id", sub.customer as string);
        }
        console.log(`Subscription ${sub.id} cancelled`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const periodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
          : null;
        await supabase
          .from("subscriptions")
          .update({
            plan: "pro",
            status: "active",
            ...(periodEnd ? { current_period_end: periodEnd } : {}),
          })
          .eq("stripe_customer_id", invoice.customer as string);
        console.log(`Invoice paid for customer ${invoice.customer}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", invoice.customer as string);
        console.log(`Invoice payment failed for customer ${invoice.customer}`);
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
