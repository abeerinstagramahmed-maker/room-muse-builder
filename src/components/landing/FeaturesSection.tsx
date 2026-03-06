import { motion } from 'framer-motion';
import { Sparkles, Zap, ShoppingCart, Palette, Shield, Heart } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Our AI understands your room layout, lighting, and dimensions to create realistic recommendations.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get a complete room redesign with product recommendations in under 30 seconds.',
  },
  {
    icon: ShoppingCart,
    title: 'Shoppable Designs',
    description: 'Every recommended piece is available to purchase — add to cart directly from your design.',
  },
  {
    icon: Palette,
    title: 'Multiple Styles',
    description: 'Choose from 6+ design styles including modern, bohemian, Scandinavian, and industrial.',
  },
  {
    icon: Shield,
    title: 'Budget-Friendly',
    description: 'Set your budget range and get recommendations that match your spending limits.',
  },
  {
    icon: Heart,
    title: 'Save & Compare',
    description: 'Save your favorite designs, compare different styles, and share with friends or family.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Everything You Need to{' '}
            <span className="text-gradient">Design Better</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features that make room design effortless
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-2xl border border-border/50 bg-card p-6 shadow-card transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
