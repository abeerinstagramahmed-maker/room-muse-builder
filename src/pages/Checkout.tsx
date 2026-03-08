import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/hooks/useCheckout';
import { Lock, CreditCard, Truck, Home, Tag, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const Checkout = () => {
  const { items, totalPrice } = useCart();
  const { isProcessing, shipping, tax, orderTotal, processOrder } = useCheckout();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? totalPrice * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
    : 0;

  const adjustedTotal = orderTotal - couponDiscount;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons' as any)
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: 'Invalid coupon', description: 'This coupon code is not valid.', variant: 'destructive' });
        return;
      }

      const coupon = data as any;
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({ title: 'Coupon expired', description: 'This coupon has expired.', variant: 'destructive' });
        return;
      }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast({ title: 'Coupon exhausted', description: 'This coupon has been fully redeemed.', variant: 'destructive' });
        return;
      }
      if (coupon.min_order && totalPrice < coupon.min_order) {
        toast({ title: 'Minimum not met', description: `Minimum order of $${coupon.min_order} required.`, variant: 'destructive' });
        return;
      }

      setAppliedCoupon({ code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value });
      toast({ title: 'Coupon applied!', description: `${coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processOrder(formData);
  };

  return (
    <Layout>
      <SEOHead title="Checkout" description="Complete your Roomly furniture order securely." />
      <div className="container py-8 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/"><Home className="h-4 w-4" /></Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/cart">Cart</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <div>
            <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="mt-1"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      required
                      className="mt-1"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                  <Truck className="h-5 w-5 text-primary" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" required className="mt-1" value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required className="mt-1" value={formData.lastName} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required className="mt-1" value={formData.address} onChange={handleChange} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required className="mt-1" value={formData.city} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required className="mt-1" value={formData.state} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" required className="mt-1" value={formData.zip} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment
                </h2>
                <p className="text-sm text-muted-foreground">
                  You'll be securely redirected to Stripe to complete payment. If Stripe isn't configured yet, your order will be confirmed directly.
                </p>
              </div>

              <Button
                type="submit"
                size="xl"
                variant="hero"
                className="w-full gap-2"
                disabled={isProcessing}
              >
                <Lock className="h-4 w-4" />
                {isProcessing ? 'Processing...' : `Pay $${adjustedTotal.toFixed(2)}`}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Your payment information is secured with SSL encryption
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}`}
                    className="flex gap-4"
                  >
                    <div className="relative">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      {item.selectedColor && (
                        <p className="text-sm text-muted-foreground">
                          {item.selectedColor}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">${totalPrice.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-sage">Free</span>
                    ) : (
                      `$${shipping}`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium">${tax.toFixed(2)}</dd>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-bold">${orderTotal.toFixed(2)}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
