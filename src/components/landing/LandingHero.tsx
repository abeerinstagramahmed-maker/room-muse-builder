import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Interior Design
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
          >
            Redesign Any Room{' '}
            <span className="text-gradient">in Seconds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Snap a photo of your room, choose a style, and let our AI create a stunning 
            redesign with shoppable furniture recommendations — all in under 30 seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--ai-coral))] px-8 text-base font-semibold shadow-lg hover:shadow-xl">
                <Camera className="h-5 w-5" />
                Try It Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="rounded-xl px-8 text-base">
                Browse Furniture
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            ✨ First room redesign is free — no credit card required
          </motion.p>
        </div>

        {/* Hero image / mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-12 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-[hsl(var(--ai-amber))]/60" />
              <div className="h-3 w-3 rounded-full bg-[hsl(var(--sage))]/60" />
              <span className="ml-2 text-xs text-muted-foreground">Roomly AI Designer</span>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="flex flex-col items-center justify-center border-r border-border/30 p-8 md:p-12">
                <Camera className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Upload your room photo</p>
                <p className="mt-1 text-xs text-muted-foreground/60">JPG, PNG up to 10MB</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-8 md:p-12">
                <Sparkles className="mb-4 h-12 w-12 text-primary/40" />
                <p className="text-sm font-medium text-primary">AI-Generated Redesign</p>
                <p className="mt-1 text-xs text-muted-foreground/60">With shoppable products</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
