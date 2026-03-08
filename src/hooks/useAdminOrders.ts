import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderItem } from '@/hooks/useOrders';

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );

      toast({
        title: 'Success',
        description: `Order status updated to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updateOrderFulfillment = useCallback(async (
    orderId: string,
    data: { admin_notes?: string; tracking_number?: string; estimated_delivery?: string }
  ) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update(data as any)
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, ...data } : order
        )
      );

      toast({
        title: 'Success',
        description: 'Fulfillment info saved',
      });
    } catch (error: any) {
      console.error('Error updating fulfillment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save fulfillment info',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getOrderStats = useCallback(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
    };
  }, [orders]);

  return {
    orders,
    loading,
    refetch: fetchAllOrders,
    updateOrderStatus,
    updateOrderFulfillment,
    getOrderStats,
  };
}
