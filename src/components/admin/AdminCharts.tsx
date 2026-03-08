import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderItem {
  total_price: number;
  commission_percent: number | null;
  commission_amount: number | null;
  product_name: string;
  quantity: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

interface AdminChartsProps {
  orders: Order[];
}

const COLORS = ['hsl(25, 90%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(150, 60%, 45%)', 'hsl(280, 60%, 55%)', 'hsl(45, 90%, 55%)', 'hsl(0, 70%, 55%)'];

export const AdminCharts = ({ orders }: AdminChartsProps) => {
  const revenueData = useMemo(() => {
    const byMonth: Record<string, { revenue: number; orders: number; commission: number }> = {};
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!byMonth[month]) byMonth[month] = { revenue: 0, orders: 0, commission: 0 };
      byMonth[month].revenue += order.total;
      byMonth[month].orders += 1;
      const orderCommission = (order.items || []).reduce((sum, item) => {
        return sum + (item.total_price * (item.commission_percent || 15)) / 100;
      }, 0);
      byMonth[month].commission += orderCommission;
    });
    return Object.entries(byMonth).map(([month, data]) => ({ month, ...data })).slice(-12);
  }, [orders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; revenue: number; quantity: number }> = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!productMap[item.product_name]) {
          productMap[item.product_name] = { name: item.product_name, revenue: 0, quantity: 0 };
        }
        productMap[item.product_name].revenue += item.total_price;
        productMap[item.product_name].quantity += item.quantity;
      });
    });
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [orders]);

  const fulfillmentData = useMemo(() => {
    const statuses = ['pending', 'confirmed', 'placed', 'shipped', 'delivered', 'cancelled'];
    return statuses.map(s => ({
      name: s,
      value: orders.filter(o => o.status === s).length,
    })).filter(s => s.value > 0);
  }, [orders]);

  if (orders.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue & Commission Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Revenue & Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 90%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(25, 90%, 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="commissionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'revenue' ? 'Revenue' : 'Commission']} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="hsl(25, 90%, 55%)" fill="url(#revenueGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="commission" stroke="hsl(150, 60%, 45%)" fill="url(#commissionGrad)" strokeWidth={2} name="Commission" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fulfillment Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Fulfillment Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={fulfillmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                {fulfillmentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-display text-lg">Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" width={150} className="text-xs" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(25, 90%, 55%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
