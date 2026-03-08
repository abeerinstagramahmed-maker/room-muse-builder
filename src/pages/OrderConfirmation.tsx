import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { useOrders, Order } from '@/hooks/useOrders';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="mx-auto max-w-2xl text-center">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
            <Skeleton className="mx-auto mt-6 h-10 w-64" />
            <Skeleton className="mx-auto mt-4 h-6 w-96" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Order Confirmed" description="Your Roomly order has been placed successfully." />
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Header */}
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Order Confirmed! 🎉
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>

          {/* Order Summary Card */}
          {order && (
            <div className="mt-8 rounded-2xl bg-card p-6 text-left shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono text-sm font-semibold">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Items ({order.items.length})
                  </p>
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${item.unit_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-medium text-muted-foreground">Shipping To</p>
                  <p className="mt-1">
                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_address.address}, {order.shipping_address.city},{' '}
                    {order.shipping_address.state} {order.shipping_address.zip}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What's Next */}
          <div className="mt-8 rounded-2xl bg-muted/50 p-6">
            <h3 className="flex items-center justify-center gap-2 font-display text-lg font-semibold">
              <Package className="h-5 w-5 text-primary" />
              What's Next?
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>1. You'll receive an email confirmation shortly</li>
              <li>2. We'll notify you when your order ships</li>
              <li>3. Track your order status in your account</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {order && (
              <Link to={`/order/${order.id}`}>
                <Button variant="outline" className="w-full gap-2 sm:w-auto">
                  View Order Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/catalog">
              <Button variant="hero" className="w-full gap-2 sm:w-auto">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Contact Support */}
          <p className="mt-8 text-sm text-muted-foreground">
            Questions about your order?{' '}
            <a href="mailto:support@roomly.com" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
