 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Sparkles, MessageCircle, Brain } from 'lucide-react';
 
 interface AIVoiceProps {
   selectedProduct: string | null;
   currentStyle: string;
   isAnalyzing: boolean;
   onObservation?: (message: string) => void;
 }
 
 const contextualObservations = {
   idle: [
     "I notice natural light from the left... perfect for a reading corner.",
     "The proportions suggest this room could handle larger furniture pieces.",
     "Warm tones would complement the existing architecture beautifully.",
     "This space has wonderful potential for layered lighting.",
   ],
   analyzing: [
     "Mapping spatial dimensions...",
     "Identifying lighting sources and shadows...",
     "Analyzing color temperature of the room...",
     "Calculating optimal furniture placement zones...",
   ],
   productSelected: [
     "This piece was chosen for its scale—it won't overwhelm the space.",
     "The material texture creates visual warmth without adding clutter.",
     "Height and proportion align with your window sightlines.",
     "This complements other selected pieces without competing.",
   ],
   styleChange: {
     scandinavian: "Scandinavian style emphasizes light, natural materials, and functional beauty.",
     modern: "Modern design focuses on clean lines and bold simplicity.",
     bohemian: "Bohemian style celebrates texture, pattern, and personal expression.",
     minimalist: "Minimalist spaces breathe—each piece must earn its place.",
     industrial: "Industrial design reveals the beauty in raw, honest materials.",
   },
 };
 
 export const AIVoice = ({ 
   selectedProduct, 
   currentStyle, 
   isAnalyzing,
   onObservation 
 }: AIVoiceProps) => {
   const [currentMessage, setCurrentMessage] = useState('');
   const [isVisible, setIsVisible] = useState(false);
   const [messageType, setMessageType] = useState<'observation' | 'thinking' | 'insight'>('observation');
 
   useEffect(() => {
     let timeout: NodeJS.Timeout;
 
     const showMessage = (message: string, type: 'observation' | 'thinking' | 'insight') => {
       setIsVisible(false);
       setTimeout(() => {
         setCurrentMessage(message);
         setMessageType(type);
         setIsVisible(true);
         onObservation?.(message);
       }, 300);
     };
 
     if (isAnalyzing) {
       const messages = contextualObservations.analyzing;
       const randomMessage = messages[Math.floor(Math.random() * messages.length)];
       showMessage(randomMessage, 'thinking');
     } else if (selectedProduct) {
       const messages = contextualObservations.productSelected;
       const randomMessage = messages[Math.floor(Math.random() * messages.length)];
       showMessage(randomMessage, 'insight');
     } else {
       // Periodic idle observations
       timeout = setTimeout(() => {
         const messages = contextualObservations.idle;
         const randomMessage = messages[Math.floor(Math.random() * messages.length)];
         showMessage(randomMessage, 'observation');
       }, 8000 + Math.random() * 4000);
     }
 
     return () => clearTimeout(timeout);
   }, [selectedProduct, isAnalyzing, onObservation]);
 
   // Style change trigger
   useEffect(() => {
     if (currentStyle && contextualObservations.styleChange[currentStyle as keyof typeof contextualObservations.styleChange]) {
       const message = contextualObservations.styleChange[currentStyle as keyof typeof contextualObservations.styleChange];
       setIsVisible(false);
       setTimeout(() => {
         setCurrentMessage(message);
         setMessageType('insight');
         setIsVisible(true);
       }, 300);
     }
   }, [currentStyle]);
 
   const icons = {
     observation: MessageCircle,
     thinking: Brain,
     insight: Sparkles,
   };
 
   const colors = {
     observation: 'from-white/10 to-white/5',
     thinking: 'from-ai-purple/20 to-ai-purple/10',
     insight: 'from-ai-amber/20 to-ai-coral/20',
   };
 
   const Icon = icons[messageType];
 
   return (
     <AnimatePresence>
       {isVisible && currentMessage && (
         <motion.div
           initial={{ opacity: 0, y: 20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -10, scale: 0.95 }}
           transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
           className="absolute bottom-32 left-6 z-40 max-w-sm"
         >
           <motion.div
             className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br ${colors[messageType]} p-4 backdrop-blur-xl`}
             animate={{
               boxShadow: messageType === 'insight' 
                 ? ['0 0 20px hsl(var(--ai-amber) / 0.2)', '0 0 30px hsl(var(--ai-amber) / 0.3)', '0 0 20px hsl(var(--ai-amber) / 0.2)']
                 : '0 8px 32px rgba(0, 0, 0, 0.2)',
             }}
             transition={{ duration: 2, repeat: messageType === 'insight' ? Infinity : 0 }}
           >
             <motion.div
               className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                 messageType === 'thinking'
                   ? 'bg-ai-purple/30'
                   : messageType === 'insight'
                   ? 'bg-gradient-to-br from-ai-amber to-ai-coral'
                   : 'bg-white/10'
               }`}
               animate={messageType === 'thinking' ? { 
                 rotate: [0, 360],
               } : {}}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             >
               <Icon className={`h-4 w-4 ${messageType === 'insight' ? 'text-white' : 'text-white/70'}`} />
             </motion.div>
 
             <div className="flex-1">
               <motion.p
                 className="text-sm leading-relaxed text-white/80"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.1 }}
               >
                 {currentMessage}
               </motion.p>
             </div>
 
             {/* Subtle thinking indicator */}
             {messageType === 'thinking' && (
               <motion.div
                 className="absolute bottom-2 right-3 flex gap-1"
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               >
                 {[0, 1, 2].map((i) => (
                   <motion.div
                     key={i}
                     className="h-1 w-1 rounded-full bg-ai-purple"
                     animate={{ y: [0, -3, 0] }}
                     transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                   />
                 ))}
               </motion.div>
             )}
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };