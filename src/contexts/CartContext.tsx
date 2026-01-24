import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addMultipleItems: (products: Product[]) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addItem = useCallback((product: Product, quantity = 1, selectedColor?: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && item.selectedColor === selectedColor
      );
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      
      return [...prev, { product, quantity, selectedColor }];
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }, [toast]);

  const addMultipleItems = useCallback((products: Product[]) => {
    setItems(prev => {
      const newItems = [...prev];
      
      products.forEach(product => {
        const existingIndex = newItems.findIndex(item => item.product.id === product.id);
        
        if (existingIndex > -1) {
          newItems[existingIndex].quantity += 1;
        } else {
          newItems.push({ product, quantity: 1 });
        }
      });
      
      return newItems;
    });
    
    toast({
      title: "Room added to cart",
      description: `${products.length} items have been added to your cart.`,
    });
  }, [toast]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
    
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      addMultipleItems,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
