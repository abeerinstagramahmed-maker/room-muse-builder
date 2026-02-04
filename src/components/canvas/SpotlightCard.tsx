import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SpotlightCardProps {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  store: string;
  isAIRecommended?: boolean;
  matchScore?: number;
  delay?: number;
}

export const SpotlightCard = ({
  id,
  title,
  subtitle,
  image,
  price,
  store,
  isAIRecommended = false,
  matchScore = 0,
  delay = 0,
}: SpotlightCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="group relative"
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(25 100% 60% / 0.15), transparent 40%)`,
        }}
      />

      {/* Glow border on hover */}
      <motion.div
        className="absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(135deg, hsl(35 95% 55% / 0.3), hsl(15 85% 60% / 0.2), hsl(280 60% 55% / 0.3))',
          filter: 'blur(8px)',
        }}
      />

      {/* Card content */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-charcoal/60 backdrop-blur-xl transition-all duration-500 group-hover:border-white/20">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

          {/* AI Badge with pulse */}
          {isAIRecommended && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-4 top-4"
            >
              <div className="relative">
                {/* Pulse animation */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-ai-amber to-ai-coral"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ai-amber to-ai-coral px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">{matchScore}% Match</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wishlist button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Heart className="h-5 w-5" />
          </motion.button>

          {/* Quick shop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-x-4 bottom-4"
          >
            <Link to={`/product/${id}`}>
              <Button className="w-full gap-2 rounded-xl bg-white text-charcoal hover:bg-white/90">
                <ShoppingBag className="h-4 w-4" />
                Quick Shop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-medium text-white/60">
              {store}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/60">{subtitle}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-white">${price.toLocaleString()}</span>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              className="flex items-center gap-1 text-sm font-medium text-ai-coral"
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
