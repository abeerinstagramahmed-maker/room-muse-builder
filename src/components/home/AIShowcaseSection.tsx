import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const showcaseRooms = [
  {
    id: 1,
    title: 'Modern Scandinavian Living',
    style: 'Scandinavian',
    beforeImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
    productCount: 8,
    totalPrice: 4299,
  },
  {
    id: 2,
    title: 'Cozy Minimalist Bedroom',
    style: 'Minimalist',
    beforeImage: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    productCount: 6,
    totalPrice: 3199,
  },
  {
    id: 3,
    title: 'Industrial Chic Dining',
    style: 'Industrial',
    beforeImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    productCount: 7,
    totalPrice: 2899,
  },
  {
    id: 4,
    title: 'Bohemian Retreat',
    style: 'Bohemian',
    beforeImage: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
    productCount: 9,
    totalPrice: 3599,
  },
];

export const AIShowcaseSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAfter, setShowAfter] = useState<Record<number, boolean>>({});

  const toggleBeforeAfter = (id: number) => {
    setShowAfter(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % showcaseRooms.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + showcaseRooms.length) % showcaseRooms.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-dark py-24 md:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-ai-purple/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-ai-coral/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-between gap-6 md:flex-row"
        >
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI Designed Rooms
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              See What AI Can Create
            </h2>
          </div>
          <Link to="/designer">
            <Button 
              size="lg" 
              className="gap-2 rounded-2xl bg-white text-charcoal hover:bg-white/90"
            >
              Try It Yourself
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-12">
          {/* Navigation */}
          <div className="absolute -left-4 right-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4 md:-left-6 md:-right-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-12 w-12 rounded-full border-white/20 bg-charcoal/80 text-white backdrop-blur-sm hover:bg-charcoal hover:text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="h-12 w-12 rounded-full border-white/20 bg-charcoal/80 text-white backdrop-blur-sm hover:bg-charcoal hover:text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Cards */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: `calc(-${activeIndex * 100}% - ${activeIndex * 24}px)` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {showcaseRooms.map((room) => (
                <motion.div
                  key={room.id}
                  className="w-full shrink-0 md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm">
                    {/* Image */}
                    <div 
                      className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                      onClick={() => toggleBeforeAfter(room.id)}
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={showAfter[room.id] ? 'after' : 'before'}
                          src={showAfter[room.id] ? room.afterImage : room.beforeImage}
                          alt={room.title}
                          className="h-full w-full object-cover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </AnimatePresence>
                      
                      {/* Before/After toggle */}
                      <div className="absolute left-4 top-4 flex overflow-hidden rounded-full bg-charcoal/80 p-1 backdrop-blur-sm">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAfter(prev => ({ ...prev, [room.id]: false })); }}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            !showAfter[room.id] ? 'bg-white text-charcoal' : 'text-white/70 hover:text-white'
                          }`}
                        >
                          Before
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAfter(prev => ({ ...prev, [room.id]: true })); }}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            showAfter[room.id] ? 'bg-white text-charcoal' : 'text-white/70 hover:text-white'
                          }`}
                        >
                          After
                        </button>
                      </div>

                      {/* AI badge */}
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-ai-coral px-3 py-1.5 text-xs font-semibold text-white">
                        <Sparkles className="h-3 w-3" />
                        AI Designed
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Button className="gap-2 rounded-full bg-white text-charcoal hover:bg-white/90">
                          <ShoppingBag className="h-4 w-4" />
                          Shop This Room
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-ai-purple/20 px-2.5 py-0.5 text-xs font-medium text-ai-purple">
                          {room.style}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-white">
                        {room.title}
                      </h3>
                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-sm text-white/60">
                          {room.productCount} products
                        </span>
                        <span className="font-semibold text-white">
                          ${room.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {showcaseRooms.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
