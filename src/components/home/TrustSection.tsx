import { motion } from 'framer-motion';
import { Sparkles, Home, Store, Star, Shield, Truck, RefreshCw } from 'lucide-react';

const stats = [
  {
    icon: Sparkles,
    value: '10,000+',
    label: 'AI Designed Homes',
    gradient: 'from-ai-amber to-ai-coral',
  },
  {
    icon: Store,
    value: '50+',
    label: 'Partner Stores',
    gradient: 'from-ai-coral to-ai-purple',
  },
  {
    icon: Home,
    value: '500+',
    label: 'Curated Products',
    gradient: 'from-ai-purple to-secondary',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Average Rating',
    gradient: 'from-secondary to-ai-amber',
  },
];

const trustBadges = [
  { icon: Shield, label: 'Secure Checkout' },
  { icon: Truck, label: 'Free Shipping $50+' },
  { icon: RefreshCw, label: '30-Day Returns' },
];

const partnerLogos = [
  'West Elm',
  'CB2',
  'Article',
  'Pottery Barn',
  'Crate & Barrel',
  'Room & Board',
];

export const TrustSection = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container relative z-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              {/* Spotlight effect */}
              <div className="absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
              </div>

              <div className="relative">
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-display text-3xl font-bold md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <badge.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Partner logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by leading furniture brands
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />
            
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex gap-16 whitespace-nowrap"
            >
              {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
                <span
                  key={index}
                  className="text-xl font-semibold text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
                >
                  {logo}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
