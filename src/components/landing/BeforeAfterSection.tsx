import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const comparisons = [
  {
    before: 'Empty, uninspired living room',
    after: 'Modern minimalist design with curated furniture',
    style: 'Modern Minimalist',
  },
  {
    before: 'Outdated bedroom furniture',
    after: 'Warm Scandinavian retreat with natural materials',
    style: 'Scandinavian',
  },
  {
    before: 'Basic dining space',
    after: 'Elegant industrial dining with statement lighting',
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
                <div className="flex items-center justify-center bg-muted/50 p-8">
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Before</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.before}</p>
                  </div>
                </div>
                <div className="relative flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <ArrowRight className="h-3 w-3 rotate-90 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">After</p>
                    <p className="mt-2 text-sm font-medium">{item.after}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/50 px-4 py-3 text-center">
                <span className="text-xs font-medium text-primary">{item.style}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
