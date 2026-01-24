import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSavedDesigns } from '@/hooks/useSavedDesigns';
import { useOrders } from '@/hooks/useOrders';
import { Loader2, LogOut, Palette, Package, User, Trash2, ShoppingCart, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const Account = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, signOut } = useAuthContext();
  const { designs, loading: designsLoading, deleteDesign } = useSavedDesigns();
  const { orders, loading: ordersLoading } = useOrders();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">My Account</h1>
            <p className="mt-1 text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="designs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="designs" className="gap-2">
              <Palette className="h-4 w-4" />
              My Designs
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="designs">
            <Card>
              <CardHeader>
                <CardTitle>Saved Designs</CardTitle>
                <CardDescription>
                  Your AI-generated room designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {designsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : designs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Palette className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No saved designs yet</p>
                    <Link to="/designer">
                      <Button className="mt-4">Create Your First Design</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {designs.map((design) => (
                      <Card key={design.id} className="overflow-hidden">
                        {design.image_url && (
                          <div className="aspect-video overflow-hidden bg-muted">
                            <img
                              src={design.image_url}
                              alt={design.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-medium">{design.name}</h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{design.style}</span>
                            <span>•</span>
                            <span className="capitalize">{design.budget}</span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-primary">
                            ${design.total_price?.toFixed(2) || '0.00'}
                          </p>
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => deleteDesign(design.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  Your past purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No orders yet</p>
                    <Link to="/catalog">
                      <Button className="mt-4">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="font-medium">
                                ${order.total.toFixed(2)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  order.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <Link to={`/order/${order.id}`}>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Account;
