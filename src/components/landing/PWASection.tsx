import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Zap, WifiOff, Bell, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const perks = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Instant load with no app store download required' },
  { icon: WifiOff, title: 'Works Offline', desc: 'Browse designs and products even without internet' },
  { icon: Bell, title: 'Home Screen Access', desc: 'One tap from your phone — just like a native app' },
];

export const PWASection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto flex justify-center lg:order-1"
          >
            <div className="relative h-[420px] w-[210px] rounded-[2.5rem] border-[6px] border-foreground/10 bg-background p-2 shadow-2xl">
              {/* Status bar */}
              <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground/10" />
              {/* Screen content */}
              <div className="flex h-full flex-col items-center justify-center rounded-[2rem] bg-gradient-to-b from-primary/5 to-primary/15 p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--ai-coral))] shadow-lg">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <p className="font-display text-lg font-bold">Roomly</p>
                <p className="mt-1 text-xs text-muted-foreground">AI Interior Design</p>
                <div className="mt-6 w-full space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-primary/20" />
                  <div className="h-2.5 w-3/4 rounded-full bg-primary/15" />
                  <div className="h-2.5 w-5/6 rounded-full bg-primary/10" />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -right-4 top-12 rounded-xl bg-background px-3 py-2 shadow-lg border border-border/50">
              <p className="text-xs font-semibold text-primary">✓ Installed</p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:order-0"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              📱 Get the App
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Take Roomly Everywhere
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Install Roomly on your phone or desktop for instant access — no app store needed. It works just like a native app with offline support.
            </p>

            <div className="mt-8 space-y-4">
              {perks.map((perk) => (
                <div key={perk.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <perk.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{perk.title}</p>
                    <p className="text-sm text-muted-foreground">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/install">
              <Button size="lg" className="mt-8 gap-2 rounded-xl" variant="hero">
                Install Roomly
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
