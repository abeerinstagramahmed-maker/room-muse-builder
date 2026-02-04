import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  x: number;
  y: number;
  store: string;
}

interface RoomProductOverlayProps {
  products: Product[];
  selectedProduct: string | null;
  onSelectProduct: (id: string | null) => void;
  isHovered: boolean;
}

export const RoomProductOverlay = ({ 
  products, 
  selectedProduct, 
  onSelectProduct,
  isHovered 
}: RoomProductOverlayProps) => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <>
      {products.map((product) => {
        const isSelected = selectedProduct === product.id;
        const isHoveredProduct = hoveredProduct === product.id;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isHovered || isSelected ? 1 : 0.6, 
              scale: 1,
            }}
            transition={{ duration: 0.3, delay: parseFloat(product.id) * 0.1 }}
            className="absolute"
            style={{ left: `${product.x}%`, top: `${product.y}%` }}
          >
            {/* Hotspot button */}
            <motion.button
              onClick={() => onSelectProduct(isSelected ? null : product.id)}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-3 rounded-full bg-white/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Main dot */}
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-r from-ai-amber to-ai-coral shadow-lg' 
                  : 'bg-white/90 shadow-md group-hover:bg-white'
              }`}>
                <Plus className={`h-4 w-4 transition-transform ${
                  isSelected ? 'rotate-45 text-white' : 'text-charcoal'
                }`} />
              </div>
            </motion.button>

            {/* Product tooltip */}
            <AnimatePresence>
              {(isHoveredProduct || isSelected) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2"
                >
                  <div className="overflow-hidden rounded-2xl border border-white/20 bg-charcoal/95 shadow-2xl backdrop-blur-xl">
                    {/* AI badge */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-ai-amber/20 to-ai-coral/20 px-4 py-2">
                      <Sparkles className="h-3.5 w-3.5 text-ai-amber" />
                      <span className="text-xs font-medium text-ai-amber">AI Recommended</span>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="font-display font-semibold text-white">{product.name}</h4>
                        <p className="text-sm text-white/60">from {product.store}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">${product.price}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg p-0 text-white/60 hover:bg-white/10 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg bg-white px-3 text-charcoal hover:bg-white/90"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-white/20 bg-charcoal/95" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </>
  );
};
