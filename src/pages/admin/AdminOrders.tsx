import { useState, useCallback } from 'react';
import { Search, Eye, ChevronDown, Download, FileText, ExternalLink, Package, Truck, CheckCircle, Clock, MessageSquare, Copy } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/hooks/useOrders';

const orderStatuses = ['pending', 'confirmed', 'placed', 'shipped', 'delivered', 'cancelled'];

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Payment' },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Payment Confirmed' },
  placed: { color: 'bg-indigo-100 text-indigo-800', icon: Package, label: 'Placed with Vendor' },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: Clock, label: 'Cancelled' },
};

export default function AdminOrders() {
  const { orders, loading, updateOrderStatus, updateOrderFulfillment } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const { toast } = useToast();

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => statusConfig[status]?.color || 'bg-gray-100 text-gray-800';

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotes((order as any).admin_notes || '');
    setTrackingNumber((order as any).tracking_number || '');
    setEstimatedDelivery((order as any).estimated_delivery || '');
    setDetailsOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
  };

  const handleSaveFulfillment = async () => {
    if (!selectedOrder) return;
    await updateOrderFulfillment(selectedOrder.id, {
      admin_notes: adminNotes,
      tracking_number: trackingNumber,
      estimated_delivery: estimatedDelivery,
    });
    setSelectedOrder(prev => prev ? { ...prev, admin_notes: adminNotes, tracking_number: trackingNumber, estimated_delivery: estimatedDelivery } as any : null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Copied to clipboard' });
  };

  // Stats
  const stats = {
    pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    needsPlacement: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const exportCSV = useCallback(() => {
    const headers = ['Order ID', 'Customer Email', 'Date', 'Items', 'Total', 'Status', 'Tracking', 'Notes'];
    const rows = filteredOrders.map(o => [
      o.id.slice(0, 8),
      o.contact_email || 'Guest',
      new Date(o.created_at).toLocaleDateString(),
      String(o.items?.length || 0),
      `$${o.total.toFixed(2)}`,
      o.status,
      (o as any).tracking_number || '',
      (o as any).admin_notes || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }, [filteredOrders]);

  const exportPDF = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Orders Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    autoTable(doc, {
      startY: 36,
      head: [['Order ID', 'Email', 'Date', 'Items', 'Total', 'Status']],
      body: filteredOrders.map(o => [
        o.id.slice(0, 8),
        o.contact_email || 'Guest',
        new Date(o.created_at).toLocaleDateString(),
        String(o.items?.length || 0),
        `$${o.total.toFixed(2)}`,
        o.status,
      ]),
    });
    doc.save(`orders-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [filteredOrders]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Order Fulfillment</h1>
            <p className="text-muted-foreground">Manage orders and place with vendors</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={exportPDF}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm text-muted-foreground">Needs Placement</p>
            <p className="text-2xl font-bold text-blue-600">{stats.needsPlacement}</p>
          </div>
          <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4">
            <p className="text-sm text-muted-foreground">Shipped</p>
            <p className="text-2xl font-bold">{stats.shipped}</p>
          </div>
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold">{stats.delivered}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', ...orderStatuses].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="capitalize"
              >
                {s === 'all' ? 'All' : s}
              </Button>
            ))}
          </div>
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
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order.id} className={order.status === 'confirmed' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                    <TableCell className="font-mono text-sm">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.contact_email || 'Guest'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={(order as any).payment_status === 'paid' ? 'default' : 'secondary'}>
                        {(order as any).payment_status || 'unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-0">
                            <Badge className={`${getStatusColor(order.status)} cursor-pointer`}>
                              {order.status} <ChevronDown className="ml-1 h-3 w-3" />
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {orderStatuses.map(status => (
                            <DropdownMenuItem key={status} onClick={() => handleStatusChange(order.id, status)} className="capitalize">
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                        <Eye className="h-4 w-4 mr-2" /> View
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                Order #{selectedOrder?.id.slice(0, 8)} — Fulfillment
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <Tabs defaultValue="details" className="mt-2">
                <TabsList>
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor Links</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                      <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                      <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer</h4>
                    <p>{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.contact_email}</p>
                    {selectedOrder.contact_phone && <p className="text-sm text-muted-foreground">{selectedOrder.contact_phone}</p>}
                  </div>
                  {selectedOrder.shipping_address && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h4>
                      <p>{selectedOrder.shipping_address.address}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="h-12 w-12 rounded object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} {item.selected_color && `• ${item.selected_color}`}
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
                </TabsContent>

                {/* Fulfillment Tab */}
                <TabsContent value="fulfillment" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Tracking Number</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={trackingNumber}
                          onChange={e => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number..."
                        />
                        {trackingNumber && (
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(trackingNumber)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Estimated Delivery</Label>
                      <Input
                        value={estimatedDelivery}
                        onChange={e => setEstimatedDelivery(e.target.value)}
                        placeholder="e.g., 5-7 business days, March 20, 2026"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Admin Notes (internal)</Label>
                      <Textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this order (not visible to customer)..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleSaveFulfillment} className="gap-2">
                      <MessageSquare className="h-4 w-4" /> Save Fulfillment Info
                    </Button>
                  </div>

                  {/* Quick Status Actions */}
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Status Update</h4>
                    <div className="flex gap-2 flex-wrap">
                      {orderStatuses.map(status => (
                        <Button
                          key={status}
                          variant={selectedOrder.status === status ? 'default' : 'outline'}
                          size="sm"
                          className="capitalize"
                          onClick={async () => {
                            await handleStatusChange(selectedOrder.id, status);
                            setSelectedOrder(prev => prev ? { ...prev, status } : null);
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Vendor Links Tab (admin-only internal) */}
                <TabsContent value="vendor" className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      ⚠️ Internal Only — These links are never shown to customers
                    </p>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name} className="h-16 w-16 rounded object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Vendor: <span className="font-medium">{item.vendor || 'Unknown'}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} • Unit: ${item.unit_price.toFixed(2)} • Total: ${item.total_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={`/product/${item.product_id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" /> View Product
                            </a>
                          </Button>
                          {/* Purchase link would come from product record */}
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                            toast({ title: 'Purchase Link', description: `Check product record for ${item.product_name} purchase link` });
                          }}>
                            <ExternalLink className="h-4 w-4" /> Purchase Link
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
