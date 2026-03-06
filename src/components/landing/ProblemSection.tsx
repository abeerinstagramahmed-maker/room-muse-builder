import { motion } from 'framer-motion';
import { Clock, DollarSign, Frown, Sparkles } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Hours of Browsing',
    description: 'Spending endless hours on Pinterest and furniture sites trying to visualize how pieces fit together.',
  },
  {
    icon: DollarSign,
    title: 'Expensive Designers',
    description: 'Hiring an interior designer costs hundreds to thousands of dollars for a single room consultation.',
  },
  {
    icon: Frown,
    title: 'Mismatched Furniture',
    description: "Buying furniture that looked great online but doesn't match your space, leading to costly returns.",
  },
];

export const ProblemSection = () => {
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
            Designing a Room Shouldn't Be{' '}
            <span className="text-destructive">This Hard</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most people struggle with interior design — and existing solutions are either too expensive or too time-consuming.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/50 bg-card p-6 shadow-card"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-display text-lg font-semibold">{problem.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Roomly solves all of this with AI
          </div>
        </motion.div>
      </div>
    </section>
  );
};
