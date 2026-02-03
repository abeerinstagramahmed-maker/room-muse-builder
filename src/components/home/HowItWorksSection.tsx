import { motion } from 'framer-motion';
import { Upload, Wand2, ShoppingBag, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Room',
    description: 'Take a photo of any space you want to transform',
    gradient: 'from-ai-amber to-ai-coral',
  },
  {
    icon: Wand2,
    title: 'AI Redesigns It',
    description: 'Our AI analyzes your space and creates stunning designs',
    gradient: 'from-ai-coral to-ai-purple',
  },
  {
    icon: Sparkles,
    title: 'Furniture Matched',
    description: 'Real products from trusted stores matched to your design',
    gradient: 'from-ai-purple to-primary',
  },
  {
    icon: ShoppingBag,
    title: 'Shop Instantly',
    description: 'Add everything to cart and bring your vision to life',
    gradient: 'from-primary to-ai-amber',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const HowItWorksSection = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            How It Works
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            From Photo to Perfect Room
            <br />
            <span className="text-gradient-ai">in Minutes</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Experience the future of interior design with our AI-powered platform
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="absolute left-full top-12 hidden h-px w-6 bg-gradient-to-r from-border to-transparent lg:block" />
              )}
              
              <div className="relative h-full overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg md:p-8">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-ai-purple/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Step number */}
                <div className="absolute right-4 top-4 font-display text-5xl font-bold text-muted/30 md:right-6 md:top-6 md:text-6xl">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Icon */}
                <div className={`relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient}`}>
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="relative font-display text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
