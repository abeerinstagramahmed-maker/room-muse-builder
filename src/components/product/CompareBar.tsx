import { Link } from 'react-router-dom';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CompareBar = () => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();

  if (compareProducts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl p-4 shadow-xl"
      >
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {compareProducts.map(p => (
              <div key={p.id} className="relative flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <img src={p.images[0]} alt={p.name} className="h-8 w-8 rounded object-cover" />
                <span className="text-xs font-medium max-w-[100px] truncate">{p.name}</span>
                <button onClick={() => removeFromCompare(p.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearCompare}>Clear</Button>
            <Link to="/compare">
              <Button size="sm" className="gap-1.5">
                <ArrowLeftRight className="h-4 w-4" />
                Compare ({compareProducts.length})
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
