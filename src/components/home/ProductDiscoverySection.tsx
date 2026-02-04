import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/canvas/SpotlightCard';
import { Sparkles, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const products = [
  {
    id: '1',
    title: 'Aria Modular Sectional',
    subtitle: 'Cloud-soft comfort, modern silhouette',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    price: 2899,
    store: 'Article',
    isAIRecommended: true,
    matchScore: 94,
  },
  {
    id: '2',
    title: 'Oslo Accent Chair',
    subtitle: 'Scandinavian design, premium leather',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
    price: 1199,
    store: 'West Elm',
    isAIRecommended: true,
    matchScore: 91,
  },
  {
    id: '3',
    title: 'Luna Floor Lamp',
    subtitle: 'Ambient lighting, brass finish',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    price: 449,
    store: 'CB2',
    isAIRecommended: false,
    matchScore: 0,
  },
  {
    id: '4',
    title: 'Carrara Coffee Table',
    subtitle: 'Marble top, minimalist base',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80',
    price: 1599,
    store: 'Pottery Barn',
    isAIRecommended: true,
    matchScore: 88,
  },
  {
    id: '5',
    title: 'Woven Area Rug',
    subtitle: 'Handcrafted, natural fibers',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
    price: 799,
    store: 'Crate & Barrel',
    isAIRecommended: false,
    matchScore: 0,
  },
  {
    id: '6',
    title: 'Ceramic Vase Set',
    subtitle: 'Artisanal, earth tones',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80',
    price: 189,
    store: 'Room & Board',
    isAIRecommended: true,
    matchScore: 86,
  },
];

const filters = ['All', 'AI Picks', 'Living Room', 'Bedroom', 'Dining'];

export const ProductDiscoverySection = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  const filteredProducts = activeFilter === 'AI Picks' 
    ? products.filter(p => p.isAIRecommended)
    : products;

  return (
    <section className="relative overflow-hidden bg-charcoal py-24 md:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-0 top-1/4 h-[600px] w-[600px] rounded-full bg-ai-purple/5 blur-[150px]"
          animate={{
            x: [0, 50, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-ai-coral/5 blur-[150px]"
          animate={{
            x: [0, -50, 0],
            opacity: [0.4, 0.3, 0.4],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ai-amber to-ai-coral">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-white/60">AI Curated Collection</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Products That <span className="text-gradient-ai">Belong</span> In Your Space
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/60">
              Every piece selected by AI to match your style, budget, and room dimensions
            </p>
          </div>

          <Link to="/catalog">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              View Full Catalog
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex flex-wrap gap-2"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              onMouseEnter={() => setHoveredFilter(filter)}
              onMouseLeave={() => setHoveredFilter(null)}
              className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-white text-charcoal'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter === 'AI Picks' && (
                <Sparkles className="mr-1.5 inline-block h-3.5 w-3.5" />
              )}
              {filter}
              {activeFilter === filter && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 rounded-xl bg-white"
                  style={{ zIndex: -1 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {filteredProducts.map((product, index) => (
              <SpotlightCard
                key={product.id}
                {...product}
                delay={index * 0.1}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-white/50">
            Can't find what you're looking for?
          </p>
          <Link to="/designer">
            <Button 
              size="lg" 
              className="gap-2 rounded-2xl bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple px-8 text-white shadow-lg transition-all duration-300 hover:shadow-glow"
            >
              <Sparkles className="h-5 w-5" />
              Let AI Find It For You
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
