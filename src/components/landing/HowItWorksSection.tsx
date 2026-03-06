import { motion } from 'framer-motion';
import { Camera, Palette, ShoppingBag } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Camera,
    title: 'Upload Your Room',
    description: 'Take a photo of any room in your home. Our AI analyzes the space, dimensions, and lighting.',
  },
  {
    step: '02',
    icon: Palette,
    title: 'Choose Your Style',
    description: 'Pick from modern, minimalist, bohemian, Scandinavian, industrial, and more design styles.',
  },
  {
    step: '03',
    icon: ShoppingBag,
    title: 'Get Your Redesign',
    description: 'Receive a personalized room design with curated furniture recommendations you can buy instantly.',
  },
];

export const HowItWorksSection = () => {
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
            How Roomly Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to transform any room in your home
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/20 to-primary/5 md:block" />
              )}

              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 shadow-card">
                <step.icon className="h-10 w-10 text-primary" />
                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
