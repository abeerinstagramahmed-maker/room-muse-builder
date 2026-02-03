import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-dark py-24 md:py-32">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-br from-ai-amber/20 to-ai-coral/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-bl from-ai-purple/20 to-ai-coral/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-5 w-5 text-ai-amber" />
            <span className="text-sm font-medium text-white">Powered by AI</span>
          </motion.div>

          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl xl:text-6xl">
            Your Dream Room
            <br />
            <span className="text-gradient-ai">Already Exists</span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 md:text-xl">
            Let AI reveal it. Upload your space, discover your style, and shop the perfect furniture—all in one magical experience.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10"
          >
            <Link to="/designer">
              <Button 
                size="lg"
                className="group h-16 gap-3 rounded-2xl bg-gradient-to-r from-primary via-ai-coral to-ai-purple px-10 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-glow"
              >
                <Sparkles className="h-6 w-6" />
                Start Designing with AI
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-sm text-white/50"
          >
            Free to try • No credit card required • Join 10,000+ happy homes
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
