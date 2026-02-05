 import { motion } from 'framer-motion';
 
 export const AmbientBackground = () => {
   return (
     <div className="absolute inset-0 overflow-hidden">
       {/* Primary breathing gradient */}
       <motion.div
         className="absolute -left-1/4 -top-1/4 h-[100%] w-[100%] rounded-full"
         style={{
           background: 'radial-gradient(circle, hsl(var(--ai-purple) / 0.15) 0%, transparent 70%)',
         }}
         animate={{
           scale: [1, 1.15, 1.05, 1.2, 1],
           x: [0, 30, -20, 40, 0],
           y: [0, -20, 30, -10, 0],
           opacity: [0.4, 0.6, 0.5, 0.7, 0.4],
         }}
         transition={{
           duration: 25,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
       
       {/* Secondary warm gradient */}
       <motion.div
         className="absolute -bottom-1/4 -right-1/4 h-[90%] w-[90%] rounded-full"
         style={{
           background: 'radial-gradient(circle, hsl(var(--ai-coral) / 0.12) 0%, transparent 70%)',
         }}
         animate={{
           scale: [1.1, 1, 1.15, 0.95, 1.1],
           x: [0, -40, 20, -30, 0],
           y: [0, 30, -20, 40, 0],
           opacity: [0.5, 0.4, 0.6, 0.45, 0.5],
         }}
         transition={{
           duration: 30,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
 
       {/* Tertiary amber accent */}
       <motion.div
         className="absolute left-1/3 top-1/3 h-[60%] w-[60%] rounded-full"
         style={{
           background: 'radial-gradient(circle, hsl(var(--ai-amber) / 0.08) 0%, transparent 60%)',
         }}
         animate={{
           scale: [1, 1.2, 1.1, 1.25, 1],
           rotate: [0, 5, -3, 7, 0],
           opacity: [0.3, 0.5, 0.4, 0.55, 0.3],
         }}
         transition={{
           duration: 20,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
 
       {/* Drifting light beams */}
       <motion.div
         className="absolute inset-0"
         style={{
           background: 'linear-gradient(135deg, transparent 0%, hsl(var(--ai-amber) / 0.03) 25%, transparent 50%, hsl(var(--ai-purple) / 0.03) 75%, transparent 100%)',
         }}
         animate={{
           opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
           rotate: [0, 2, -1, 3, 0],
         }}
         transition={{
           duration: 35,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
 
       {/* Animated noise texture */}
       <motion.div
         className="absolute inset-0"
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
         }}
         animate={{
           opacity: [0.012, 0.02, 0.015, 0.022, 0.012],
         }}
         transition={{
           duration: 8,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
 
       {/* Subtle vignette */}
       <div 
         className="absolute inset-0 pointer-events-none"
         style={{
           background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--charcoal)) 100%)',
           opacity: 0.4,
         }}
       />
 
       {/* Scanning light effect */}
       <motion.div
         className="absolute inset-0 pointer-events-none"
         style={{
           background: 'linear-gradient(90deg, transparent 0%, hsl(var(--ai-amber) / 0.02) 50%, transparent 100%)',
         }}
         animate={{
           x: ['-100%', '100%'],
         }}
         transition={{
           duration: 15,
           repeat: Infinity,
           ease: "easeInOut",
           repeatDelay: 10,
         }}
       />
     </div>
   );
 };