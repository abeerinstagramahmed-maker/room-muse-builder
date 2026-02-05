 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
 import { Plus, Sparkles, ShoppingBag, ExternalLink, Eye, Zap } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface Product {
   id: string;
   name: string;
   price: number;
   x: number;
   y: number;
   store: string;
   matchScore?: number;
   reason?: string;
   category?: string;
 }
 
 interface IntelligentHotspotProps {
   product: Product;
   index: number;
   isRevealed: boolean;
   isSelected: boolean;
   onSelect: () => void;
   onHover: (isHovered: boolean) => void;
   isAnyHovered: boolean;
 }
 
 export const IntelligentHotspot = ({
   product,
   index,
   isRevealed,
   isSelected,
   onSelect,
   onHover,
   isAnyHovered,
 }: IntelligentHotspotProps) => {
   const [isHovered, setIsHovered] = useState(false);
   const [showTooltip, setShowTooltip] = useState(false);
   
   // Magnetic hover effect
   const mouseX = useMotionValue(0);
   const mouseY = useMotionValue(0);
   const springConfig = { damping: 25, stiffness: 200 };
   const x = useSpring(mouseX, springConfig);
   const y = useSpring(mouseY, springConfig);
   
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     const rect = e.currentTarget.getBoundingClientRect();
     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     const distX = (e.clientX - centerX) * 0.15;
     const distY = (e.clientY - centerY) * 0.15;
     mouseX.set(distX);
     mouseY.set(distY);
   };
 
   const handleMouseLeave = () => {
     mouseX.set(0);
     mouseY.set(0);
     setIsHovered(false);
     onHover(false);
     setShowTooltip(false);
   };
 
   const handleMouseEnter = () => {
     setIsHovered(true);
     onHover(true);
     setTimeout(() => setShowTooltip(true), 150);
   };
 
   // Glow intensity based on match score
   const glowIntensity = product.matchScore ? product.matchScore / 100 : 0.8;
 
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0 }}
       animate={{ 
         opacity: isRevealed ? 1 : 0, 
         scale: isRevealed ? 1 : 0,
       }}
       transition={{ 
         duration: 0.5, 
         delay: index * 0.15,
         type: "spring",
         stiffness: 200,
         damping: 20,
       }}
       className="absolute"
       style={{ 
         left: `${product.x}%`, 
         top: `${product.y}%`,
         x,
         y,
       }}
       onMouseMove={handleMouseMove}
       onMouseLeave={handleMouseLeave}
       onMouseEnter={handleMouseEnter}
     >
       {/* Outer attention ring - pulses when AI is focused */}
       <motion.div
         className="absolute -inset-6 rounded-full"
         style={{
           background: `radial-gradient(circle, hsl(var(--ai-amber) / ${glowIntensity * 0.3}) 0%, transparent 70%)`,
         }}
         animate={{
           scale: isSelected ? [1, 1.3, 1] : isHovered ? 1.2 : [1, 1.15, 1],
           opacity: isSelected ? [0.8, 0.4, 0.8] : isHovered ? 0.9 : [0.4, 0.7, 0.4],
         }}
         transition={{
           duration: isSelected ? 1.5 : 3,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
 
       {/* Core hotspot button */}
       <motion.button
         onClick={onSelect}
         className="group relative z-10"
         whileHover={{ scale: 1.15 }}
         whileTap={{ scale: 0.95 }}
       >
         {/* Depth shadow */}
         <motion.div
           className="absolute inset-0 rounded-full bg-black/40 blur-md"
           animate={{
             scale: isHovered ? 1.3 : 1.1,
             opacity: isHovered ? 0.6 : 0.4,
           }}
           style={{ transform: 'translateY(4px)' }}
         />
 
         {/* Main circle */}
         <motion.div
           className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
             isSelected
               ? 'bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple'
               : 'bg-white/95 backdrop-blur-sm'
           }`}
           animate={{
             boxShadow: isSelected
               ? '0 0 30px hsl(var(--ai-amber) / 0.6), 0 0 60px hsl(var(--ai-coral) / 0.3)'
               : isHovered
               ? '0 0 20px hsl(var(--ai-amber) / 0.4), 0 8px 32px rgba(0,0,0,0.3)'
               : '0 4px 16px rgba(0,0,0,0.2)',
           }}
         >
           <motion.div
             animate={{ rotate: isSelected ? 45 : 0 }}
             transition={{ duration: 0.2 }}
           >
             {isSelected ? (
               <Plus className="h-5 w-5 text-white" />
             ) : (
               <Eye className="h-4 w-4 text-charcoal" />
             )}
           </motion.div>
         </motion.div>
 
         {/* Match score badge */}
         {product.matchScore && product.matchScore > 85 && (
           <motion.div
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: index * 0.15 + 0.3 }}
             className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-ai-amber to-ai-coral text-[10px] font-bold text-white shadow-lg"
           >
             <Zap className="h-3 w-3" />
           </motion.div>
         )}
       </motion.button>
 
       {/* Intelligent tooltip */}
       <AnimatePresence>
         {showTooltip && (isHovered || isSelected) && (
           <motion.div
             initial={{ opacity: 0, y: 10, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 10, scale: 0.9 }}
             transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
             className="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2"
           >
             <div className="overflow-hidden rounded-2xl border border-white/15 bg-charcoal/95 shadow-2xl backdrop-blur-xl">
               {/* AI confidence header */}
               <div className="relative overflow-hidden bg-gradient-to-r from-ai-amber/20 via-ai-coral/20 to-ai-purple/20 px-4 py-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Sparkles className="h-4 w-4 text-ai-amber" />
                     <span className="text-xs font-semibold text-ai-amber">AI Match</span>
                   </div>
                   {product.matchScore && (
                     <motion.span
                       initial={{ opacity: 0, x: 10 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="text-lg font-bold text-white"
                     >
                       {product.matchScore}%
                     </motion.span>
                   )}
                 </div>
                 {/* Animated progress bar */}
                 <motion.div
                   className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-ai-amber to-ai-coral"
                   initial={{ width: 0 }}
                   animate={{ width: `${product.matchScore || 85}%` }}
                   transition={{ duration: 0.8, delay: 0.2 }}
                 />
               </div>
 
               <div className="p-4">
                 {/* Product info */}
                 <div className="mb-3">
                   <h4 className="font-display text-lg font-semibold text-white">{product.name}</h4>
                   <p className="text-sm text-white/50">from {product.store}</p>
                 </div>
 
                 {/* AI reasoning */}
                 {product.reason && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     transition={{ delay: 0.3 }}
                     className="mb-4 rounded-xl bg-white/5 p-3"
                   >
                     <p className="text-xs font-medium uppercase tracking-wider text-white/40">Why this works</p>
                     <p className="mt-1 text-sm leading-relaxed text-white/70">{product.reason}</p>
                   </motion.div>
                 )}
 
                 {/* Actions */}
                 <div className="flex items-center justify-between">
                   <span className="text-xl font-bold text-white">${product.price.toLocaleString()}</span>
                   <div className="flex gap-2">
                     <Button
                       size="sm"
                       variant="ghost"
                       className="h-9 w-9 rounded-xl p-0 text-white/50 hover:bg-white/10 hover:text-white"
                     >
                       <ExternalLink className="h-4 w-4" />
                     </Button>
                     <Button
                       size="sm"
                       className="h-9 gap-2 rounded-xl bg-white px-4 text-charcoal hover:bg-white/90"
                     >
                       <ShoppingBag className="h-4 w-4" />
                       Add
                     </Button>
                   </div>
                 </div>
               </div>
 
               {/* Tooltip arrow */}
               <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-white/15 bg-charcoal/95" />
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
   );
 };