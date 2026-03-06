import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingCTA = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-8 text-center md:p-16"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Ready to Transform Your Space?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Your first room redesign is completely free. Upload a photo and see the magic of AI-powered interior design.
          </p>
          <Link to="/auth">
            <Button size="lg" className="mt-8 gap-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--ai-coral))] px-8 text-base font-semibold">
              Start Designing for Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
