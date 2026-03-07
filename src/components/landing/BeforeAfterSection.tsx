import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import beforeLivingRoom from '@/assets/before-living-room.jpg';
import afterLivingRoom from '@/assets/after-living-room.jpg';
import beforeBedroom from '@/assets/before-bedroom.jpg';
import afterBedroom from '@/assets/after-bedroom.jpg';
import beforeDining from '@/assets/before-dining.jpg';
import afterDining from '@/assets/after-dining.jpg';

const comparisons = [
  {
    before: beforeLivingRoom,
    after: afterLivingRoom,
    beforeLabel: 'Empty, uninspired living room',
    afterLabel: 'Modern minimalist with curated furniture',
    style: 'Modern Minimalist',
  },
  {
    before: beforeBedroom,
    after: afterBedroom,
    beforeLabel: 'Bare bedroom with old mattress',
    afterLabel: 'Warm Scandinavian retreat',
    style: 'Scandinavian',
  },
  {
    before: beforeDining,
    after: afterDining,
    beforeLabel: 'Basic outdated dining space',
    afterLabel: 'Elegant industrial dining room',
    style: 'Industrial Chic',
  },
];

export const BeforeAfterSection = () => {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            See the Transformation
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from our AI-powered room designer
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {comparisons.map((item, i) => (
            <motion.div
              key={item.style}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card"
            >
              <div className="grid grid-rows-2">
                {/* Before Image */}
                <div className="relative">
                  <img
                    src={item.before}
                    alt={item.beforeLabel}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                      Before
                    </span>
                  </div>
                </div>

                {/* After Image */}
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
                      <ArrowRight className="h-3 w-3 rotate-90 text-primary-foreground" />
                    </div>
                  </div>
                  <img
                    src={item.after}
                    alt={item.afterLabel}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                      After
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/50 px-4 py-3 text-center">
                <span className="text-xs font-medium text-primary">{item.style}</span>
                <p className="mt-1 text-xs text-muted-foreground">{item.afterLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
