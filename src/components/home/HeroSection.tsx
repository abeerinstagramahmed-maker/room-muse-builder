import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-hero">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-ai-amber/20 via-ai-coral/15 to-ai-purple/10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-ai-purple/15 via-ai-coral/10 to-ai-amber/20 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.3, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-ai-glow/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container relative z-10">
        <div className="grid min-h-[90vh] items-center gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Content */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span>Powered by AI</span>
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">New</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
            >
              Design Your Space
              <br />
              with AI.{' '}
              <span className="text-gradient-ai">Shop It Instantly.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl"
            >
              Upload a photo of your room, let AI reimagine it, and shop every piece of furniture in one click. The future of interior design is here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/designer">
                <Button 
                  size="lg" 
                  className="group relative h-14 gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-ai-coral to-ai-purple px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-glow"
                >
                  <Sparkles className="h-5 w-5" />
                  Try AI Designer
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 gap-2 rounded-2xl border-2 px-8 text-base font-semibold transition-all duration-300 hover:bg-accent"
                >
                  <Play className="h-5 w-5" />
                  Explore Rooms
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex gap-8 md:gap-12"
            >
              {[
                { value: '10k+', label: 'Rooms designed' },
                { value: '500+', label: 'Products available' },
                { value: '4.9★', label: 'User rating' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="font-display text-2xl font-bold md:text-3xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Main image card */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elevated lg:aspect-[3/4]">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                alt="AI-designed modern living room"
                className="h-full w-full object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              
              {/* AI badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 shadow-lg backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-sm font-medium">AI Designed</span>
              </motion.div>
            </div>

            {/* Floating product card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -left-4 bottom-12 w-64 rounded-2xl bg-background/95 p-4 shadow-elevated backdrop-blur-sm md:-left-8 md:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80"
                    alt="Sofa"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary">AI Match</p>
                  <p className="font-display text-sm font-semibold">Aria Modular Sofa</p>
                  <p className="text-sm font-semibold text-muted-foreground">$2,499</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1.5, delay: 1.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-ai-coral"
                  />
                </div>
                <span className="text-xs font-medium text-primary">92% match</span>
              </div>
            </motion.div>

            {/* Floating style tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -right-2 top-1/3 rounded-full bg-gradient-to-r from-primary to-ai-coral px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg md:-right-4"
            >
              ✨ Modern Minimalist
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
