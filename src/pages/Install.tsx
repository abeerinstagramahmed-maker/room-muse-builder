import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Smartphone, Monitor, Apple, Share, PlusSquare, MoreVertical, ArrowDown, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const iosSteps = [
  { icon: Share, title: 'Tap the Share button', desc: 'Open Safari and navigate to roomly.app. Tap the Share icon (square with an arrow) at the bottom of the screen.' },
  { icon: ArrowDown, title: 'Scroll & tap "Add to Home Screen"', desc: 'Scroll down in the share menu until you see "Add to Home Screen" and tap it.' },
  { icon: PlusSquare, title: 'Confirm & tap "Add"', desc: 'You can customize the name, then tap "Add" in the top-right corner. Roomly will appear on your home screen!' },
];

const androidSteps = [
  { icon: MoreVertical, title: 'Tap the menu (⋮)', desc: 'Open Chrome and navigate to roomly.app. Tap the three-dot menu in the top-right corner.' },
  { icon: Download, title: 'Tap "Install app" or "Add to Home Screen"', desc: 'Look for "Install app" (or "Add to Home screen") in the dropdown menu and tap it.' },
  { icon: CheckCircle2, title: 'Confirm installation', desc: 'Tap "Install" in the confirmation dialog. Roomly will appear on your home screen instantly!' },
];

const desktopSteps = [
  { icon: Monitor, title: 'Look for the install icon', desc: 'Open Chrome, Edge, or another supported browser and go to roomly.app. Look for the install icon (⊕) in the address bar.' },
  { icon: Download, title: 'Click "Install"', desc: 'Click the install icon and confirm the installation in the popup dialog.' },
  { icon: CheckCircle2, title: 'Launch from desktop', desc: 'Roomly will open as a standalone window and be available from your desktop, taskbar, or Start menu.' },
];

const faqItems = [
  { q: "Is Roomly free to install?", a: "Yes! Installing Roomly as a web app is completely free. There is no app store, no download fees, and no subscriptions required to install." },
  { q: "Does it work offline?", a: "Yes. Once installed, Roomly caches key pages and assets so you can browse products and your saved designs even without internet. Some features like AI design generation require an internet connection." },
  { q: "How is this different from a regular app?", a: "Roomly is a Progressive Web App (PWA). It uses modern web technology to deliver an app-like experience without the overhead of app stores. It installs instantly, updates automatically, and takes up much less storage than traditional apps." },
  { q: "Will I get updates automatically?", a: "Yes! Unlike app store apps, PWAs update silently in the background. Every time you open Roomly, you will always have the latest version." },
  { q: "Can I uninstall it?", a: "Absolutely. On iOS, long-press the icon and tap Delete Bookmark. On Android, long-press and tap Uninstall. On desktop, right-click the icon or go to browser settings." },
  { q: "Why does iOS use Safari?", a: "Apple requires PWAs on iOS to be installed through Safari. Other browsers like Chrome on iOS do not support the Add to Home Screen feature with full PWA capabilities." },
];

const StepCard = ({ step, index }: { step: typeof iosSteps[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="h-full border-border/50">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <step.icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
            <h3 className="font-semibold">{step.title}</h3>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Install = () => {
  const { canPrompt, isInstalled, promptInstall } = usePWAInstall();

  return (
    <Layout>
      <SEOHead
        title="Install Roomly App"
        description="Install Roomly on your phone or desktop for instant access. No app store needed — works offline with a native app experience."
      />

      <div className="container py-12 md:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--ai-coral))]">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold md:text-5xl">
            Install Roomly
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground md:text-lg">
            Get the full app experience — faster loads, offline access, and one-tap launch from your home screen.
          </p>

          {isInstalled ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Roomly is already installed on this device!
            </div>
          ) : canPrompt ? (
            <Button
              size="xl"
              variant="hero"
              onClick={promptInstall}
              className="mt-6 gap-2"
            >
              <Download className="h-5 w-5" />
              Install Roomly Now
            </Button>
          ) : null}
        </motion.div>

        {/* Tabbed instructions */}
        <div className="mx-auto mt-16 max-w-3xl">
          <Tabs defaultValue="ios">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="ios" className="gap-1.5">
                <Apple className="h-4 w-4" />
                iPhone / iPad
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-1.5">
                <Smartphone className="h-4 w-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-1.5">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="mt-8 space-y-4">
              <div className="rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong> You must use <strong className="text-foreground">Safari</strong> on iOS. Other browsers don't support PWA installation on Apple devices.
              </div>
              {iosSteps.map((step, i) => (
                <StepCard key={step.title} step={step} index={i} />
              ))}
            </TabsContent>

            <TabsContent value="android" className="mt-8 space-y-4">
              <div className="rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> Chrome, Edge, and Samsung Internet all support PWA installation on Android.
              </div>
              {androidSteps.map((step, i) => (
                <StepCard key={step.title} step={step} index={i} />
              ))}
            </TabsContent>

            <TabsContent value="desktop" className="mt-8 space-y-4">
              <div className="rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Supported browsers:</strong> Google Chrome, Microsoft Edge, and other Chromium-based browsers.
              </div>
              {desktopSteps.map((step, i) => (
                <StepCard key={step.title} step={step} index={i} />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Layout>
  );
};

export default Install;
