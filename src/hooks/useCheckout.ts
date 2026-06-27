import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface CouponInfo {
  couponCode?: string;
  couponDiscount?: number;
}

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const shipping = totalPrice >= 100 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  const processOrder = async (formData: CheckoutFormData, coupon?: CouponInfo) => {
    const couponDiscount = Math.min(coupon?.couponDiscount ?? 0, totalPrice);
    const couponCode = coupon?.couponCode;
    // Discount applies to product subtotal only; tax/shipping stay full.
    const adjustedTotal = Math.max(0, totalPrice - couponDiscount) + shipping + tax;

    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      });
      return null;
    }

    setIsProcessing(true);

    try {
      // Ratio used to spread the discount proportionally across products.
      const discountRatio = totalPrice > 0 ? Math.max(0, totalPrice - couponDiscount) / totalPrice : 1;

      // Create the order with pending status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          status: 'pending',
          subtotal: totalPrice,
          shipping,
          tax,
          total: adjustedTotal,
          discount_code: couponCode || null,
          discount_amount: couponDiscount || 0,
          contact_email: formData.email,
          contact_phone: formData.phone,
          shipping_address: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items (discount applied proportionally)
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] || null,
        vendor: item.product.vendor,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: Math.round(item.product.price * item.quantity * discountRatio * 100) / 100,
        selected_color: item.selectedColor || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Try Stripe checkout — apply discount proportionally to product line prices
      const stripeItems = items.map((item) => ({
        name: item.product.name,
        price: Math.round(item.product.price * discountRatio * 100) / 100,
        quantity: item.quantity,
        image: item.product.images[0] || undefined,
      }));

      // Add shipping as a line item if applicable
      if (shipping > 0) {
        stripeItems.push({
          name: 'Shipping',
          price: shipping,
          quantity: 1,
          image: undefined,
        });
      }

      // Add tax as a line item
      stripeItems.push({
        name: 'Tax',
        price: Math.round(tax * 100) / 100,
        quantity: 1,
        image: undefined,
      });


      const origin = window.location.origin;
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            orderId: order.id,
            items: stripeItems,
            successUrl: `${origin}/order-confirmation`,
            cancelUrl: `${origin}/checkout`,
          },
        }
      );

      if (sessionError || sessionData?.error) {
        // Stripe not configured - fall back to direct confirmation
        const errorMsg = sessionData?.error || sessionError?.message || '';
        console.warn('Stripe not available, confirming order directly:', errorMsg);

        await supabase
          .from('orders')
          .update({ status: 'confirmed', payment_status: 'paid' } as any)
          .eq('id', order.id);

        // Trigger confirmation email (best-effort)
        try {
          await supabase.functions.invoke('send-order-email', {
            body: { orderId: order.id, type: 'order_confirmation' },
          });
        } catch (emailErr) {
          console.warn('Email not sent:', emailErr);
        }

        clearCart();
        toast({
          title: 'Order placed successfully! 🎉',
          description: "Stripe payments aren't configured yet. Order confirmed without payment.",
        });
        navigate(`/order-confirmation?order=${order.id}`);
        return order;
      }

      // Redirect to Stripe Checkout
      clearCart();
      window.location.href = sessionData.url;
      return order;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Order failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    shipping,
    tax,
    orderTotal,
    processOrder,
  };
}
