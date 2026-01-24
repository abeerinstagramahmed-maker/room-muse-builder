import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOrders, Order } from '@/hooks/useOrders';
import { Loader2, ArrowLeft, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      const orderData = await getOrderById(id);
      setOrder(orderData);
      setLoading(false);
    };
    
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [id, isAuthenticated, getOrderById]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Order not found</p>
          <Link to="/account">
            <Button className="mt-4">Back to Account</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Link to="/account" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span className="font-medium capitalize">{order.status}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.product_image && (
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      {item.vendor && (
                        <p className="text-sm text-muted-foreground">{item.vendor}</p>
                      )}
                      {item.selected_color && (
                        <p className="text-sm text-muted-foreground">Color: {item.selected_color}</p>
                      )}
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.total_price.toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-muted-foreground">
                          ${item.unit_price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.address}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                    <br />
                    {order.shipping_address.country}
                  </p>
                </CardContent>
              </Card>
            )}

            {order.contact_email && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.contact_email}</p>
                  {order.contact_phone && (
                    <p className="text-muted-foreground">{order.contact_phone}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;
