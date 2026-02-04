import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

const aiMessages = [
  "I see potential for a cozy reading nook by the window...",
  "Your space would transform beautifully with warm Scandinavian tones...",
  "Let me suggest some minimalist pieces that would open up the room...",
  "I'm detecting great natural light for a modern bohemian style...",
];

export const AIRevealSection = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);

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
        }, 5000);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-charcoal">
      {/* Darkened canvas effect */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal/80 to-charcoal" />
      </div>

      {/* Animated orbs */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-ai-purple/10 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-ai-coral/10 blur-[120px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.3, 0.4],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="container relative z-10 flex min-h-[80vh] flex-col items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* AI Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple blur-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Typing text */}
          <div className="mx-auto mb-8 h-24 max-w-3xl">
            <p className="font-display text-2xl font-medium leading-relaxed text-white/80 md:text-3xl lg:text-4xl">
              "{displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1 inline-block h-8 w-0.5 bg-ai-coral"
                />
              )}
              "
            </p>
          </div>

          {/* Button appears after typing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showButton ? 1 : 0, 
              y: showButton ? 0 : 20 
            }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/designer">
              <Button
                size="lg"
                className="group h-16 gap-3 rounded-2xl bg-gradient-to-r from-primary via-ai-coral to-ai-purple px-10 text-lg font-semibold text-white shadow-2xl transition-all duration-500 hover:shadow-glow"
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
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
