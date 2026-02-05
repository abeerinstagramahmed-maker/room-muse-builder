 import { useState, useEffect, useRef } from 'react';
 import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
 import { Upload, Brain, Wand2, ShoppingBag, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Link } from 'react-router-dom';
 
 const journeySteps = [
   {
     id: 1,
     icon: Upload,
     title: 'Share Your Space',
     description: 'Upload a photo of any room. Our AI begins analyzing immediately.',
     aiNote: 'Detecting room dimensions, light sources, and existing elements...',
     gradient: 'from-blue-500/20 to-ai-purple/20',
     accentColor: 'text-blue-400',
   },
   {
     id: 2,
     icon: Brain,
     title: 'AI Understands Context',
     description: 'We map every detail—lighting, proportions, architectural features.',
     aiNote: 'Room type: Living Room. Natural light: Strong (west-facing). Style potential: High.',
     gradient: 'from-ai-purple/20 to-ai-coral/20',
     accentColor: 'text-ai-purple',
   },
   {
     id: 3,
     icon: Wand2,
     title: 'AI Designs & Matches',
     description: 'Products are selected specifically for your space, not randomly recommended.',
     aiNote: 'Matched 12 products from 4 partner stores. Total budget: $8,500. Style confidence: 94%.',
     gradient: 'from-ai-coral/20 to-ai-amber/20',
     accentColor: 'text-ai-coral',
   },
   {
     id: 4,
     icon: ShoppingBag,
     title: 'Shop With Confidence',
     description: 'Every piece shows why it was chosen. No guessing, no returns.',
     aiNote: 'Commission transparency: We earn 8-12% when you purchase. Prices are never marked up.',
     gradient: 'from-ai-amber/20 to-green-500/20',
     accentColor: 'text-ai-amber',
   },
 ];
 
 export const AIJourneySection = () => {
   const [activeStep, setActiveStep] = useState(0);
   const [isAutoPlaying, setIsAutoPlaying] = useState(true);
   const sectionRef = useRef<HTMLElement>(null);
   
   const { scrollYProgress } = useScroll({
     target: sectionRef,
     offset: ["start end", "end start"],
   });
 
   const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
   const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
 
   // Auto-advance steps
   useEffect(() => {
     if (!isAutoPlaying) return;
     
     const interval = setInterval(() => {
       setActiveStep((prev) => (prev + 1) % journeySteps.length);
     }, 4000);
     
     return () => clearInterval(interval);
   }, [isAutoPlaying]);
 
   const handleStepClick = (index: number) => {
     setActiveStep(index);
     setIsAutoPlaying(false);
     setTimeout(() => setIsAutoPlaying(true), 10000);
   };
 
   return (
     <section
       ref={sectionRef}
       className="relative min-h-screen overflow-hidden bg-charcoal py-24 md:py-32"
     >
       {/* Animated background */}
       <motion.div
         className="absolute inset-0"
         style={{ y: backgroundY }}
       >
         <motion.div
           className="absolute left-0 top-1/4 h-[800px] w-[800px] rounded-full bg-ai-purple/5 blur-[200px]"
           animate={{
             x: [0, 100, 0],
             opacity: [0.3, 0.5, 0.3],
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
         />
         <motion.div
           className="absolute bottom-0 right-0 h-[800px] w-[800px] rounded-full bg-ai-coral/5 blur-[200px]"
           animate={{
             x: [0, -100, 0],
             opacity: [0.4, 0.3, 0.4],
           }}
           transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
         />
       </motion.div>
 
       {/* Noise texture */}
       <div 
         className="absolute inset-0 opacity-[0.015]"
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
         }}
       />
 
       <motion.div
         className="container relative z-10"
         style={{ opacity }}
       >
         {/* Section header */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="mb-16 text-center md:mb-20"
         >
           <motion.div
             className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
             whileHover={{ scale: 1.02 }}
           >
             <Sparkles className="h-4 w-4 text-ai-amber" />
             <span className="text-sm font-medium text-white/70">Watch AI Think</span>
           </motion.div>
           
           <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
             Four Moments of{' '}
             <span className="text-gradient-ai">Intelligence</span>
           </h2>
           <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50">
             Not a process. A conversation between you and AI.
           </p>
         </motion.div>
 
         {/* Main journey display */}
         <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
           {/* Left: Visual canvas representation */}
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative"
           >
             <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
               {/* Simulated canvas */}
               <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90">
                 <img
                   src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                   alt="AI Canvas Preview"
                   className="h-full w-full object-cover opacity-40"
                 />
               </div>
 
               {/* Step-specific overlays */}
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeStep}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
                   className={`absolute inset-0 bg-gradient-to-br ${journeySteps[activeStep].gradient}`}
                 />
               </AnimatePresence>
 
               {/* AI scan effect for step 2 */}
               {activeStep === 1 && (
                 <motion.div
                   className="absolute inset-0"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                 >
                   <motion.div
                     className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ai-purple to-transparent"
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   />
                 </motion.div>
               )}
 
               {/* Product hotspots for step 3 */}
               {activeStep === 2 && (
                 <>
                   {[
                     { x: 25, y: 60 },
                     { x: 55, y: 45 },
                     { x: 75, y: 55 },
                   ].map((pos, i) => (
                     <motion.div
                       key={i}
                       className="absolute"
                       style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ delay: i * 0.3, duration: 0.4 }}
                     >
                       <motion.div
                         className="h-4 w-4 rounded-full bg-ai-coral"
                         animate={{
                           boxShadow: ['0 0 10px hsl(var(--ai-coral) / 0.5)', '0 0 25px hsl(var(--ai-coral) / 0.8)', '0 0 10px hsl(var(--ai-coral) / 0.5)'],
                         }}
                         transition={{ duration: 1.5, repeat: Infinity }}
                       />
                     </motion.div>
                   ))}
                 </>
               )}
 
               {/* Success checkmarks for step 4 */}
               {activeStep === 3 && (
                 <motion.div
                   className="absolute inset-0 flex items-center justify-center"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring", stiffness: 200 }}
                 >
                   <div className="rounded-full bg-green-500/20 p-8 backdrop-blur-sm">
                     <CheckCircle2 className="h-16 w-16 text-green-400" />
                   </div>
                 </motion.div>
               )}
 
               {/* AI note overlay */}
               <motion.div
                 className="absolute bottom-4 left-4 right-4"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
               >
                 <div className="rounded-xl border border-white/10 bg-charcoal/80 p-3 backdrop-blur-xl">
                   <div className="flex items-center gap-2">
                     <motion.div
                       animate={{ rotate: activeStep === 1 ? 360 : 0 }}
                       transition={{ duration: 2, repeat: activeStep === 1 ? Infinity : 0, ease: "linear" }}
                     >
                       <Brain className={`h-4 w-4 ${journeySteps[activeStep].accentColor}`} />
                     </motion.div>
                     <motion.p
                       key={activeStep}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="text-xs text-white/60"
                     >
                       {journeySteps[activeStep].aiNote}
                     </motion.p>
                   </div>
                 </div>
               </motion.div>
             </div>
           </motion.div>
 
           {/* Right: Step indicators and content */}
           <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="flex flex-col justify-center"
           >
             <div className="space-y-4">
               {journeySteps.map((step, index) => {
                 const Icon = step.icon;
                 const isActive = index === activeStep;
 
                 return (
                   <motion.button
                     key={step.id}
                     onClick={() => handleStepClick(index)}
                     className={`group relative w-full text-left transition-all duration-300 ${
                       isActive ? 'z-10' : ''
                     }`}
                     whileHover={{ x: 8 }}
                   >
                     <div
                       className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                         isActive
                           ? 'border-white/20 bg-white/5'
                           : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.02]'
                       }`}
                     >
                       {/* Active indicator */}
                       {isActive && (
                         <motion.div
                           layoutId="activeStep"
                           className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"
                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
                         />
                       )}
 
                       <div className="relative flex items-start gap-4">
                         {/* Icon */}
                         <motion.div
                           className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                             isActive
                               ? `bg-gradient-to-br ${step.gradient}`
                               : 'bg-white/5'
                           }`}
                           animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                           transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                         >
                           <Icon
                             className={`h-6 w-6 transition-colors ${
                               isActive ? step.accentColor : 'text-white/40'
                             }`}
                           />
                         </motion.div>
 
                         {/* Content */}
                         <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-medium text-white/30">0{step.id}</span>
                             <h3
                               className={`font-display text-lg font-semibold transition-colors ${
                                 isActive ? 'text-white' : 'text-white/60'
                               }`}
                             >
                               {step.title}
                             </h3>
                           </div>
                           
                           <AnimatePresence>
                             {isActive && (
                               <motion.p
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: 'auto' }}
                                 exit={{ opacity: 0, height: 0 }}
                                 transition={{ duration: 0.3 }}
                                 className="mt-2 text-sm text-white/50"
                               >
                                 {step.description}
                               </motion.p>
                             )}
                           </AnimatePresence>
                         </div>
 
                         {/* Progress indicator */}
                         {isActive && (
                           <motion.div
                             className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-ai-amber to-ai-coral"
                             initial={{ width: 0 }}
                             animate={{ width: '100%' }}
                             transition={{ duration: 4, ease: "linear" }}
                           />
                         )}
                       </div>
                     </div>
                   </motion.button>
                 );
               })}
             </div>
 
             {/* CTA */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.5 }}
               className="mt-10"
             >
               <Link to="/designer">
                 <Button
                   size="lg"
                   className="group gap-3 rounded-2xl bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-glow"
                 >
                   <Sparkles className="h-5 w-5" />
                   Try It Now
                   <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                 </Button>
               </Link>
             </motion.div>
           </motion.div>
         </div>
       </motion.div>
     </section>
   );
 };