import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Returns = () => (
  <Layout>
    <SEOHead title="Returns & Refunds" description="Learn about Roomly's 30-day return policy, refund process, and exchange options." />
    <div className="container max-w-3xl py-12 md:py-20">
      <h1 className="font-display text-4xl font-bold">Returns & Refunds</h1>
      <p className="mt-3 text-muted-foreground">Hassle-free returns within 30 days</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-start gap-4 p-6">
            <Clock className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">30-Day Window</h3>
              <p className="mt-1 text-sm text-muted-foreground">Return most items within 30 days of delivery for a full refund.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 p-6">
            <RotateCcw className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Free Returns</h3>
              <p className="mt-1 text-sm text-muted-foreground">We provide prepaid return labels for all eligible items.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="font-display text-2xl font-bold">Eligible Items</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p className="text-muted-foreground">Items in original, unused condition with packaging</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p className="text-muted-foreground">Furniture that hasn't been assembled</p>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-muted-foreground">Custom or made-to-order items</p>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-muted-foreground">Items marked as final sale</p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold">Refund Process</h2>
        <p className="text-muted-foreground">Once we receive your return, refunds are processed within 5-7 business days to your original payment method. You'll receive an email confirmation when the refund is issued.</p>
      </div>
    </div>
  </Layout>
);

export default Returns;
