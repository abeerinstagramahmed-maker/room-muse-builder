 import { useState, useEffect, useRef } from 'react';
 import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
 import { Sparkles, ArrowRight, Brain } from 'lucide-react';

const aiMessages = [
   "I see potential for a cozy reading nook by the window. The natural light there would be perfect for a comfortable chair and a small side table.",
   "Your space would transform beautifully with warm Scandinavian tones. I'm thinking oak wood, soft textiles, and clean lines.",
   "Let me suggest some minimalist pieces that would open up the room. Less furniture, more breathing space.",
   "I'm detecting great natural light for a modern bohemian style. Layered textures and earthy colors would thrive here.",
];

export const AIRevealSection = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);
   const sectionRef = useRef<HTMLElement>(null);
 
   const { scrollYProgress } = useScroll({
     target: sectionRef,
     offset: ["start end", "end start"],
   });
 
   const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
   const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const message = aiMessages[currentMessage];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);
    setShowButton(false);

     const typingInterval = setInterval(() => { 
      if (charIndex <= message.length) {
        setDisplayedText(message.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTimeout(() => setShowButton(true), 500);
        setTimeout(() => {
          setCurrentMessage((prev) => (prev + 1) % aiMessages.length);
         }, 6000);
      }
     }, 30);

    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  return (
     <section ref={sectionRef} className="relative min-h-[90vh] overflow-hidden bg-charcoal">
      {/* Darkened canvas effect */}
       <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        <div 
           className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
          }}
        />
         <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal/70 to-charcoal" />
       </motion.div>

      {/* Animated orbs */}
      <motion.div
         className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-ai-purple/8 blur-[150px]"
        animate={{
           scale: [1, 1.3, 1.1, 1.25, 1],
           x: [0, 50, -30, 40, 0],
           opacity: [0.3, 0.5, 0.4, 0.55, 0.3],
        }}
         transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
         className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-ai-coral/8 blur-[150px]"
        animate={{
           scale: [1.2, 1, 1.3, 0.95, 1.2],
           x: [0, -60, 30, -40, 0],
           opacity: [0.4, 0.3, 0.5, 0.35, 0.4],
        }}
         transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
 
       {/* Noise texture */}
       <div 
         className="absolute inset-0 opacity-[0.015]"
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
         }}
       />

      {/* Content */}
       <motion.div className="container relative z-10 flex min-h-[90vh] flex-col items-center justify-center py-24" style={{ opacity }}>
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
           transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* AI Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
             className="mb-10 inline-flex"
          >
            <div className="relative">
              <motion.div
                 className="absolute -inset-4 rounded-full bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple blur-2xl"
                animate={{
                   scale: [1, 1.4, 1.2, 1.5, 1],
                   opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
                }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
               <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple shadow-2xl">
                 <motion.div
                   animate={{ rotate: [0, 5, -5, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                 >
                   <Brain className="h-12 w-12 text-white" />
                 </motion.div>
              </div>
            </div>
          </motion.div>
 
           {/* Intro text */}
           <motion.p
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="mb-6 text-sm font-medium uppercase tracking-widest text-white/40"
           >
             AI is thinking...
           </motion.p>

          {/* Typing text */}
           <div className="mx-auto mb-10 min-h-32 max-w-4xl">
             <p className="font-display text-2xl font-medium leading-relaxed text-white/80 md:text-3xl lg:text-5xl">
               &ldquo;{displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                   transition={{ duration: 0.6, repeat: Infinity }}
                   className="ml-1 inline-block h-6 w-0.5 bg-ai-coral md:h-8"
                />
              )}
               &rdquo;
            </p>
          </div>

          {/* Button appears after typing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showButton ? 1 : 0, 
              y: showButton ? 0 : 20 
            }}
             transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <Link to="/designer">
              <Button
                size="lg"
                 className="group h-16 gap-3 rounded-2xl bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple px-12 text-lg font-semibold text-white shadow-2xl transition-all duration-500 hover:shadow-glow"
              >
                <Sparkles className="h-6 w-6" />
                Reveal Your Dream Room
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showButton ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-sm text-white/40"
          >
            Free to try • No credit card required • Join 10,000+ happy homes
          </motion.p>
        </motion.div>
       </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
