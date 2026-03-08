import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CompareContextType {
  compareIds: string[];
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const addToCompare = useCallback((product: Product) => {
    setCompareProducts(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      if (prev.length >= 4) {
        toast({ title: 'Compare limit', description: 'You can compare up to 4 products', variant: 'destructive' });
        return prev;
      }
      toast({ title: 'Added to compare' });
      return [...prev, product];
    });
  }, [toast]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareProducts([]), []);

  const isComparing = useCallback((productId: string) => compareProducts.some(p => p.id === productId), [compareProducts]);

  return (
    <CompareContext.Provider value={{
      compareIds: compareProducts.map(p => p.id),
      compareProducts,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isComparing,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
