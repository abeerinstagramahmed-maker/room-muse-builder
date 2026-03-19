import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'roomly_pwa_prompt_dismissed';

export const PWAInstallPrompt = () => {
  const { canPrompt, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }
    // Show after 5 seconds on mobile
    if (isMobile) {
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isInstalled]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    if (canPrompt) {
      await promptInstall();
      dismiss();
    }
  };

  if (!isMobile || isInstalled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[60] rounded-2xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-xl"
        >
          <button onClick={dismiss} className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--ai-coral))]">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 pr-4">
              <h3 className="font-display text-sm font-bold">Install Roomly</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add to your home screen for a faster, app-like experience — works offline!
              </p>
              <div className="mt-3 flex gap-2">
                {canPrompt ? (
                  <Button size="sm" onClick={handleInstall} className="gap-1.5 rounded-xl text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Install Now
                  </Button>
                ) : isIOS ? (
                  <Link to="/install" onClick={dismiss}>
                    <Button size="sm" className="gap-1.5 rounded-xl text-xs">
                      <Download className="h-3.5 w-3.5" />
                      How to Install
                    </Button>
                  </Link>
                ) : (
                  <Link to="/install" onClick={dismiss}>
                    <Button size="sm" className="gap-1.5 rounded-xl text-xs">
                      <Download className="h-3.5 w-3.5" />
                      Learn More
                    </Button>
                  </Link>
                )}
                <Button size="sm" variant="ghost" onClick={dismiss} className="rounded-xl text-xs">
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
