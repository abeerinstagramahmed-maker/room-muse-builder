import { useState } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/hooks/useOrders';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { orders, loading, updateOrderStatus } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Orders Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? 'No orders found matching your search' : 'No orders yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.contact_email || 'Guest'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.items?.length || 0} items
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-0">
                            <Badge className={`${getStatusColor(order.status)} cursor-pointer`}>
                              {order.status}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {orderStatuses.map(status => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              className="capitalize"
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                Order #{selectedOrder?.id.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                    <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer</h4>
                  <p>{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.contact_email}</p>
                  {selectedOrder.contact_phone && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.contact_phone}</p>
                  )}
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h4>
                    <p>{selectedOrder.shipping_address.address}</p>
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}
                    </p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                )}

                <Separator />

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.vendor} • Qty: {item.quantity}
                            {item.selected_color && ` • ${item.selected_color}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.total_price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Commission: ${((item.total_price * (item.commission_percent || 15)) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
