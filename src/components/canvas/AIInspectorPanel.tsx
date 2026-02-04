import { motion } from 'framer-motion';
import { X, Sparkles, Home, Palette, DollarSign, Store, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AIInspectorPanelProps {
  onClose: () => void;
  selectedProduct: string | null;
  onClearProduct: () => void;
}

const roomAnalysis = {
  roomType: 'Living Room',
  confidence: 94,
  detectedStyle: 'Modern Scandinavian',
  styleConfidence: 87,
  budgetRange: '$8,000 - $12,000',
  productCount: 8,
  stores: ['Article', 'West Elm', 'CB2', 'Pottery Barn'],
};

const productDetails = {
  '1': { name: 'Nordic Lounge Chair', price: 899, store: 'Article', match: 92, reason: 'Perfect ergonomic design matching your minimalist preference' },
  '2': { name: 'Minimalist Coffee Table', price: 649, store: 'West Elm', match: 88, reason: 'Clean lines complement the sofa angle' },
  '3': { name: 'Arc Floor Lamp', price: 299, store: 'CB2', match: 95, reason: 'Optimal lighting for the reading corner you specified' },
  '4': { name: 'Velvet Modular Sofa', price: 2499, store: 'Article', match: 91, reason: 'Matches your preference for warm textures' },
};

export const AIInspectorPanel = ({ onClose, selectedProduct, onClearProduct }: AIInspectorPanelProps) => {
  const product = selectedProduct ? productDetails[selectedProduct as keyof typeof productDetails] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="absolute right-6 top-1/2 z-40 w-80 -translate-y-1/2"
    >
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-charcoal/80 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-ai-amber to-ai-coral">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-semibold text-white">AI Inspector</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] space-y-1 overflow-y-auto p-2">
          {product ? (
            // Product Detail View
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 p-3"
            >
              <button
                onClick={onClearProduct}
                className="mb-2 flex items-center gap-1 text-sm text-white/60 hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to overview
              </button>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ai-coral">AI Selected</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-white/60">{product.store}</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-white/60">Match Score</span>
                  <span className="font-semibold text-ai-amber">{product.match}%</span>
                </div>
                <Progress value={product.match} className="h-2 bg-white/10" />
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Why AI chose this</p>
                <p className="text-sm leading-relaxed text-white/80">{product.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">${product.price}</span>
                <Button className="gap-2 rounded-xl bg-white text-charcoal hover:bg-white/90">
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ) : (
            // Room Overview
            <>
              {/* Room Type */}
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">Detected Room</p>
                    <p className="font-semibold text-white">{roomAnalysis.roomType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40">Confidence</p>
                    <p className="font-semibold text-ai-amber">{roomAnalysis.confidence}%</p>
                  </div>
                </div>
                <Progress value={roomAnalysis.confidence} className="h-1.5 bg-white/10" />
              </div>

              {/* Style */}
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">Applied Style</p>
                    <p className="font-semibold text-white">{roomAnalysis.detectedStyle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40">Match</p>
                    <p className="font-semibold text-ai-coral">{roomAnalysis.styleConfidence}%</p>
                  </div>
                </div>
                <Progress value={roomAnalysis.styleConfidence} className="h-1.5 bg-white/10" />
              </div>

              {/* Budget */}
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">Total Budget</p>
                    <p className="font-semibold text-white">{roomAnalysis.budgetRange}</p>
                  </div>
                </div>
              </div>

              {/* Stores */}
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/40">Partner Stores</p>
                    <p className="text-sm text-white/60">{roomAnalysis.stores.length} stores used</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roomAnalysis.stores.map((store) => (
                    <span
                      key={store}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80"
                    >
                      {store}
                    </span>
                  ))}
                </div>
              </div>

              {/* Products count */}
              <div className="rounded-2xl bg-gradient-to-br from-ai-amber/20 to-ai-coral/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/60">Products in Design</p>
                    <p className="mt-1 text-2xl font-bold text-white">{roomAnalysis.productCount}</p>
                  </div>
                  <Button variant="ghost" className="gap-1 text-white hover:bg-white/10 hover:text-white">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple text-white">
            <ShoppingBag className="h-4 w-4" />
            Shop Entire Room
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
