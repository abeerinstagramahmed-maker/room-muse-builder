import { useCallback } from 'react';
import { Product } from '@/lib/types';

const STORAGE_KEY = 'roomly-recently-viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const getRecentlyViewed = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const addToRecentlyViewed = useCallback((productId: string) => {
    const ids = getRecentlyViewed().filter(id => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  }, [getRecentlyViewed]);

  return { getRecentlyViewed, addToRecentlyViewed };
}
