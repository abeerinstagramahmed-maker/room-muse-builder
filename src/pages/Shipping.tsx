import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Truck, Clock, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const policies = [
  { icon: DollarSign, title: 'Free Shipping', desc: 'Orders over $100 ship free within the continental US.' },
  { icon: Clock, title: 'Standard Delivery', desc: '5-10 business days for most items. Larger furniture may take 7-14 days.' },
  { icon: Truck, title: 'Express Shipping', desc: 'Available at checkout for select items. 2-3 business days.' },
  { icon: MapPin, title: 'Delivery Areas', desc: 'We currently ship to all 50 US states. International shipping coming soon.' },
];

const Shipping = () => (
  <Layout>
    <SEOHead title="Shipping Policy" description="Learn about Roomly's shipping options, delivery times, and free shipping threshold." />
    <div className="container max-w-3xl py-12 md:py-20">
      <h1 className="font-display text-4xl font-bold">Shipping Policy</h1>
      <p className="mt-3 text-muted-foreground">Fast, reliable delivery to your door</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {policies.map((p, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-4 p-6">
              <p.icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 space-y-6 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">Tracking Your Order</h2>
        <p>Once your order ships, you'll receive a confirmation email with a tracking number. You can also track orders from your Account page under "My Orders".</p>
        <h2 className="font-display text-2xl font-bold text-foreground">Delivery Issues</h2>
        <p>If your package arrives damaged or is missing items, please contact us within 48 hours of delivery. We'll arrange a replacement or refund promptly.</p>
      </div>
    </div>
  </Layout>
);

export default Shipping;
