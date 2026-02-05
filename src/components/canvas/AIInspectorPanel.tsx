 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { X, Sparkles, Home, Palette, DollarSign, Store, ChevronRight, ShoppingBag, ChevronDown, Lightbulb, Ruler, Eye } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 interface AIInspectorPanelProps {
   onClose: () => void;
   selectedProduct: string | null;
   onClearProduct: () => void;
   isRecalibrating?: boolean;
 }
 
 const initialRoomAnalysis = {
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
 
 const expandableDetails = [
   { title: 'Spatial Fit', explanation: 'This piece fits perfectly within the available floor space, maintaining recommended walkway clearances on all sides.' },
   { title: 'Style Coherence', explanation: 'The clean lines and neutral upholstery align with the Modern Scandinavian style detected in your space.' },
   { title: 'Light Interaction', explanation: 'The fabric works well with the west-facing natural light, preventing glare while maintaining warmth.' },
 ];
 
 const AnimatedValue = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
   const [displayValue, setDisplayValue] = useState(0);
 
   useEffect(() => {
     const duration = 800;
     const steps = 30;
     const increment = value / steps;
     let current = 0;
     
     const timer = setInterval(() => {
       current += increment;
       if (current >= value) {
         setDisplayValue(value);
         clearInterval(timer);
       } else {
         setDisplayValue(Math.floor(current));
       }
     }, duration / steps);
 
     return () => clearInterval(timer);
   }, [value]);
 
   return <span>{displayValue}{suffix}</span>;
 };
 
 const ExpandableReason = ({ title, explanation }: { title: string; explanation: string }) => {
   const [isOpen, setIsOpen] = useState(false);
 
   return (
     <div className="rounded-xl bg-white/5 overflow-hidden">
       <button
         onClick={() => setIsOpen(!isOpen)}
         className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-white/5"
       >
         <div className="flex items-center gap-2">
           <Lightbulb className="h-4 w-4 text-ai-amber" />
           <span className="text-sm font-medium text-white/70">{title}</span>
         </div>
         <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
           <ChevronDown className="h-4 w-4 text-white/40" />
         </motion.div>
       </button>
       <AnimatePresence>
         {isOpen && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.2 }}
           >
             <p className="px-3 pb-3 text-xs leading-relaxed text-white/50">{explanation}</p>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 };
 
 export const AIInspectorPanel = ({ onClose, selectedProduct, onClearProduct, isRecalibrating = false }: AIInspectorPanelProps) => {
   const [roomAnalysis, setRoomAnalysis] = useState(initialRoomAnalysis);
   const [showRecalibrating, setShowRecalibrating] = useState(false);
 
   useEffect(() => {
     if (isRecalibrating) {
       setShowRecalibrating(true);
       const timer = setTimeout(() => {
         setRoomAnalysis({
           ...initialRoomAnalysis,
           confidence: Math.floor(90 + Math.random() * 8),
           styleConfidence: Math.floor(85 + Math.random() * 10),
         });
         setShowRecalibrating(false);
       }, 1500);
       return () => clearTimeout(timer);
     }
   }, [isRecalibrating]);
 
   const product = selectedProduct ? productDetails[selectedProduct as keyof typeof productDetails] : null;
 
   return (
     <motion.div
       initial={{ opacity: 0, x: 40 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: 40 }}
       transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
       className="absolute right-6 top-1/2 z-40 w-80 -translate-y-1/2"
     >
       <motion.div
         className="overflow-hidden rounded-3xl border border-white/10 bg-charcoal/80 shadow-2xl backdrop-blur-2xl"
         animate={{
           boxShadow: showRecalibrating
             ? ['0 0 30px hsl(var(--ai-purple) / 0.3)', '0 0 50px hsl(var(--ai-purple) / 0.4)', '0 0 30px hsl(var(--ai-purple) / 0.3)']
             : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
         }}
         transition={{ duration: 1.5, repeat: showRecalibrating ? Infinity : 0 }}
       >
         <div className="flex items-center justify-between border-b border-white/10 p-4">
           <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-ai-amber to-ai-coral">
               <Sparkles className="h-4 w-4 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="font-display font-semibold text-white">AI Inspector</span>
               {showRecalibrating && (
                 <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-ai-purple">
                   Recalibrating...
                 </motion.span>
               )}
             </div>
           </div>
           <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white">
             <X className="h-4 w-4" />
           </button>
         </div>
 
         <div className="max-h-[60vh] space-y-1 overflow-y-auto p-2">
           {product ? (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-3">
               <button onClick={onClearProduct} className="mb-2 flex items-center gap-1 text-sm text-white/60 hover:text-white">
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
                   <motion.span key={product.match} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-semibold text-ai-amber">
                     <AnimatedValue value={product.match} suffix="%" />
                   </motion.span>
                 </div>
                 <motion.div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                   <motion.div className="h-full bg-gradient-to-r from-ai-amber to-ai-coral" initial={{ width: 0 }} animate={{ width: `${product.match}%` }} transition={{ duration: 0.8 }} />
                 </motion.div>
               </div>
 
               <div className="rounded-2xl bg-white/5 p-4">
                 <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Why AI chose this</p>
                 <p className="text-sm leading-relaxed text-white/80">{product.reason}</p>
               </div>
 
               <div className="space-y-2">
                 {expandableDetails.map((detail) => (
                   <ExpandableReason key={detail.title} title={detail.title} explanation={detail.explanation} />
                 ))}
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
             <>
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
                     <motion.p key={roomAnalysis.confidence} className="font-semibold text-ai-amber" initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                       <AnimatedValue value={roomAnalysis.confidence} suffix="%" />
                     </motion.p>
                   </div>
                 </div>
                 <motion.div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                   <motion.div className="h-full bg-gradient-to-r from-ai-amber to-ai-coral" initial={{ width: 0 }} animate={{ width: `${roomAnalysis.confidence}%` }} transition={{ duration: 1 }} />
                 </motion.div>
               </div>
 
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
                     <motion.p key={roomAnalysis.styleConfidence} className="font-semibold text-ai-coral" initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                       <AnimatedValue value={roomAnalysis.styleConfidence} suffix="%" />
                     </motion.p>
                   </div>
                 </div>
                 <motion.div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                   <motion.div className="h-full bg-gradient-to-r from-ai-coral to-ai-purple" initial={{ width: 0 }} animate={{ width: `${roomAnalysis.styleConfidence}%` }} transition={{ duration: 1.2, delay: 0.1 }} />
                 </motion.div>
               </div>
 
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
 
               <div className="rounded-2xl bg-white/5 p-4">
                 <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">Detected Constraints</p>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2 text-sm text-white/60">
                     <Ruler className="h-4 w-4 text-ai-purple" />
                     <span>12&apos; x 18&apos; floor space</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-white/60">
                     <Eye className="h-4 w-4 text-ai-amber" />
                     <span>West-facing natural light</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-white/60">
                     <Home className="h-4 w-4 text-ai-coral" />
                     <span>Open floor plan</span>
                   </div>
                 </div>
               </div>
 
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
                     <span key={store} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">{store}</span>
                   ))}
                 </div>
               </div>
 
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
 
         <div className="border-t border-white/10 p-4">
           <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple text-white">
             <ShoppingBag className="h-4 w-4" />
             Shop Entire Room
           </Button>
         </div>
       </motion.div>
     </motion.div>
   );
 };
