import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try Roomly with one free room redesign',
    features: [
      '1 room redesign',
      'All design styles',
      'Product recommendations',
      'Save your design',
    ],
    cta: 'Get Started Free',
    href: '/auth',
    highlighted: false,
  },
  {
    name: 'Pro Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Unlimited redesigns for any room in your home',
    features: [
      'Unlimited room redesigns',
      'All design styles',
      'Priority AI processing',
      'Save unlimited designs',
      'Shop curated furniture',
      'Email support',
    ],
    cta: 'Start Pro Monthly',
    href: '/pricing',
    highlighted: true,
  },
  {
    name: 'Pro Yearly',
    price: '$99',
    period: '/year',
    description: 'Best value — save over 17% with annual billing',
    features: [
      'Everything in Pro Monthly',
      'Save over 17%',
      'Early access to new styles',
      'Priority support',
    ],
    cta: 'Start Pro Yearly',
    href: '/pricing',
    highlighted: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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

              <div className="mb-6">
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to={plan.href}>
                <Button
                  className="w-full rounded-xl"
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
