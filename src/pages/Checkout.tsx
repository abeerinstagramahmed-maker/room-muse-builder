import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Lock, CreditCard, Truck } from 'lucide-react';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shipping = totalPrice >= 100 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearCart();
    toast({
      title: "Order placed successfully! 🎉",
      description: "You'll receive a confirmation email shortly.",
    });
    navigate('/');
    setIsProcessing(false);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Link
          to="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to cart
        </Link>

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
                      <Input id="firstName" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required className="mt-1" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" required className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="xl"
                variant="hero"
                className="w-full gap-2"
                disabled={isProcessing}
              >
                <Lock className="h-4 w-4" />
                {isProcessing ? 'Processing...' : `Pay $${orderTotal.toFixed(2)}`}
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
