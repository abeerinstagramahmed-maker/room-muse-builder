import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try Roomly with one free room redesign',
    features: ['1 room redesign', 'All design styles', 'Product recommendations', 'Save your design'],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Unlimited redesigns for any room',
    features: ['Unlimited room redesigns', 'All design styles', 'Priority AI processing', 'Save unlimited designs', 'Shop curated furniture', 'Email support'],
    highlighted: true,
    billingPeriod: 'monthly',
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    price: '$99',
    period: '/year',
    description: 'Best value — save over 17%',
    features: ['Everything in Pro Monthly', 'Save over 17%', 'Early access to new styles', 'Priority support'],
    billingPeriod: 'yearly',
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuthContext();
  const { isPro, loading: subLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (billingPeriod: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }

    setLoadingPlan(billingPeriod);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {
          billingPeriod,
          successUrl: `${window.location.origin}/account?tab=subscription`,
          cancelUrl: `${window.location.origin}/pricing`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Layout>
      <SEOHead title="Pricing Plans" description="Choose the right Roomly plan for your interior design needs. Free, Pro, and Business options available." />
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-bold md:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {isPro ? 'You are currently on the Pro plan' : 'Start free, upgrade anytime'}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 shadow-card ${
                plan.highlighted
                  ? 'border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-lg'
                  : 'border-border/50 bg-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="my-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                isPro ? (
                  <Button variant="outline" className="w-full rounded-xl" disabled>
                    Current: Pro
                  </Button>
                ) : (
                  <Link to={isAuthenticated ? '/designer' : '/auth'}>
                    <Button variant="outline" className="w-full rounded-xl">
                      {isAuthenticated ? 'Go to Designer' : 'Sign Up Free'}
                    </Button>
                  </Link>
                )
              ) : isPro ? (
                <Button variant="outline" className="w-full rounded-xl" disabled>
                  Active Plan
                </Button>
              ) : (
                <Button
                  className="w-full rounded-xl"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  disabled={!!loadingPlan || subLoading}
                  onClick={() => handleSubscribe(plan.billingPeriod!)}
                >
                  {loadingPlan === plan.billingPeriod ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Subscribe
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
