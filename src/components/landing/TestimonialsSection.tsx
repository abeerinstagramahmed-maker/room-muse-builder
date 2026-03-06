import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'First-time homeowner',
    quote: "I was clueless about decorating my new apartment. Roomly gave me a complete living room design in seconds — and I actually bought every piece it recommended!",
    rating: 5,
  },
  {
    name: 'David K.',
    role: 'Interior design enthusiast',
    quote: "I've tried other design tools, but Roomly's AI actually understands my space. The recommendations fit perfectly with my room's dimensions and lighting.",
    rating: 5,
  },
  {
    name: 'Jessica L.',
    role: 'Busy parent',
    quote: "No time for Pinterest boards and store visits. I uploaded my bedroom photo, picked 'Scandinavian,' and got a beautiful design with a shopping list. Done!",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
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
            Loved by Homeowners
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands who've transformed their spaces with Roomly
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/50 bg-card p-6 shadow-card"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[hsl(var(--ai-amber))] text-[hsl(var(--ai-amber))]" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
              <div className="mt-4 border-t border-border/50 pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
