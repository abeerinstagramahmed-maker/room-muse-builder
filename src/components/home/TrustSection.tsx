import { motion } from 'framer-motion';
import { Sparkles, Home, Store, Star } from 'lucide-react';

const stats = [
  {
    icon: Sparkles,
    value: '10,000+',
    label: 'AI Designed Homes',
  },
  {
    icon: Store,
    value: '50+',
    label: 'Partner Stores',
  },
  {
    icon: Home,
    value: '500+',
    label: 'Curated Products',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Average Rating',
  },
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
    <section className="py-24 md:py-32">
      <div className="container">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <p className="font-display text-3xl font-bold md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Partner logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by leading furniture brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partnerLogos.map((logo, index) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                className="text-lg font-medium text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
