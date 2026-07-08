import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface EmailPayload {
  orderId: string;
  type: 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
  trackingNumber?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get email settings from store_settings
    const { data: emailSettingsData } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'email')
      .single();

    const emailSettings = emailSettingsData?.value as {
      enabled: boolean;
      resendApiKey: string;
      fromEmail: string;
      fromName: string;
    } | null;

    if (!emailSettings?.enabled || !emailSettings?.resendApiKey) {
      console.log('[send-order-email] Email notifications not configured, skipping');
      return new Response(
        JSON.stringify({ success: false, reason: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get store settings for branding
    const { data: storeSettingsData } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store')
      .single();

    const storeSettings = storeSettingsData?.value as { name: string; supportEmail: string } | null;
    const storeName = storeSettings?.name || 'Roomly';

    const { orderId, type, trackingNumber }: EmailPayload = await req.json();

    if (!orderId || !type) {
      return new Response(
        JSON.stringify({ error: 'orderId and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`*, items:order_items(*)`)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!order.contact_email) {
      return new Response(
        JSON.stringify({ success: false, reason: 'No contact email on order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build email content based on type
    const { subject, html } = buildEmailContent(type, order, storeName, trackingNumber);

    // Send via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailSettings.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${emailSettings.fromName || storeName} <${emailSettings.fromEmail || 'orders@roomly.com'}>`,
        to: [order.contact_email],
        subject,
        html,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[send-order-email] Resend error:', resendResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-order-email] Sent ${type} email for order ${orderId}`);
    return new Response(
      JSON.stringify({ success: true, emailId: resendResult.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-order-email] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEmailContent(
  type: string,
  order: any,
  storeName: string,
  trackingNumber?: string
): { subject: string; html: string } {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const shipping = order.shipping_address || {};
  const items = order.items || [];

  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" />` : ''}
          <div>
            <strong>${item.product_name}</strong>
            <br /><span style="color: #666;">Qty: ${item.quantity}${item.selected_color ? ` &middot; ${item.selected_color}` : ''}</span>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600;">
        $${item.total_price.toFixed(2)}
      </td>
    </tr>
  `).join('');


  const baseStyle = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8f8f8; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #e8752b, #d4683a); padding: 32px; text-align: center; color: white; }
      .content { padding: 32px; }
      .footer { padding: 24px 32px; background: #f8f8f8; text-align: center; color: #888; font-size: 13px; }
    </style>
  `;

  const footer = `
    <div class="footer">
      <p>Thank you for shopping with ${storeName}</p>
      <p style="margin-top: 8px; font-size: 12px;">
        If you have questions, reply to this email or contact our support team.
      </p>
    </div>
  `;

  switch (type) {
    case 'order_confirmation':
      return {
        subject: `Order Confirmed #${orderId} – ${storeName}`,
        html: `<!DOCTYPE html><html><head>${baseStyle}</head><body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Order #${orderId}</p>
            </div>
            <div class="content">
              <p>Hi ${shipping.firstName || 'there'},</p>
              <p>Your order has been confirmed and our team is preparing it for fulfillment.</p>
              
              <h3 style="margin-top: 24px;">Shopping List (${items.length} item${items.length === 1 ? '' : 's'})</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>

              <h3 style="margin-top: 24px;">Order Summary</h3>
              
              <div style="margin-top: 24px; padding: 16px; background: #f8f8f8; border-radius: 8px;">
                <table style="width: 100%;">
                  <tr><td>Subtotal</td><td style="text-align: right;">$${order.subtotal.toFixed(2)}</td></tr>
                  <tr><td>Shipping</td><td style="text-align: right;">${order.shipping === 0 ? 'Free' : '$' + order.shipping.toFixed(2)}</td></tr>
                  <tr><td>Tax</td><td style="text-align: right;">$${order.tax.toFixed(2)}</td></tr>
                  <tr style="font-weight: bold; font-size: 18px;"><td style="padding-top: 12px; border-top: 2px solid #ddd;">Total</td><td style="text-align: right; padding-top: 12px; border-top: 2px solid #ddd;">$${order.total.toFixed(2)}</td></tr>
                </table>
              </div>

              ${shipping.address ? `
                <h3 style="margin-top: 24px;">Shipping To</h3>
                <p style="color: #666;">
                  ${shipping.firstName} ${shipping.lastName}<br />
                  ${shipping.address}<br />
                  ${shipping.city}, ${shipping.state} ${shipping.zip}
                </p>
              ` : ''}

              <p style="margin-top: 24px;">We'll notify you when your order ships. Estimated delivery: 5-14 business days.</p>
            </div>
            ${footer}
          </div>
        </body></html>`,
      };

    case 'order_shipped':
      return {
        subject: `Your Order #${orderId} Has Shipped! 📦`,
        html: `<!DOCTYPE html><html><head>${baseStyle}</head><body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Your Order Has Shipped! 📦</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Order #${orderId}</p>
            </div>
            <div class="content">
              <p>Hi ${shipping.firstName || 'there'},</p>
              <p>Great news — your order is on its way!</p>
              ${trackingNumber ? `
                <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; color: #666;">Tracking Number</p>
                  <p style="margin: 8px 0 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${trackingNumber}</p>
                </div>
              ` : ''}
              <p>Estimated delivery: 3-7 business days from shipment.</p>
            </div>
            ${footer}
          </div>
        </body></html>`,
      };

    case 'order_delivered':
      return {
        subject: `Order #${orderId} Delivered! ✅`,
        html: `<!DOCTYPE html><html><head>${baseStyle}</head><body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
              <h1 style="margin: 0; font-size: 24px;">Order Delivered! ✅</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Order #${orderId}</p>
            </div>
            <div class="content">
              <p>Hi ${shipping.firstName || 'there'},</p>
              <p>Your order has been delivered. We hope you love your new furniture!</p>
              <p>If you have any issues, please don't hesitate to reach out.</p>
            </div>
            ${footer}
          </div>
        </body></html>`,
      };

    case 'order_cancelled':
      return {
        subject: `Order #${orderId} Cancelled`,
        html: `<!DOCTYPE html><html><head>${baseStyle}</head><body>
          <div class="container">
            <div class="header" style="background: #666;">
              <h1 style="margin: 0; font-size: 24px;">Order Cancelled</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Order #${orderId}</p>
            </div>
            <div class="content">
              <p>Hi ${shipping.firstName || 'there'},</p>
              <p>Your order has been cancelled. If a payment was made, a refund will be processed within 5-10 business days.</p>
              <p>If this was a mistake or you'd like to re-order, you can visit our store anytime.</p>
            </div>
            ${footer}
          </div>
        </body></html>`,
      };

    default:
      return { subject: `Order Update #${orderId}`, html: `<p>Your order #${orderId} has been updated.</p>` };
  }
}
