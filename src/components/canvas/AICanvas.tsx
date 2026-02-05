 import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Upload, 
  Wand2, 
  Layers, 
  Palette,
  Sofa,
  Lightbulb,
  ChevronRight,
  Command,
  ArrowRight,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIInspectorPanel } from './AIInspectorPanel';
import { AICommandBar } from './AICommandBar';
 import { IntelligentHotspot } from './IntelligentHotspot';
 import { AmbientBackground } from './AmbientBackground';
 import { AIVoice } from './AIVoice';

 const intelligentProducts = [
   { 
     id: '1', 
     name: 'Nordic Lounge Chair', 
     price: 899, 
     x: 18, 
     y: 58, 
     store: 'Article',
     matchScore: 94,
     reason: 'Ergonomic design complements your preference for comfort. The oak frame matches existing wood tones detected in your space.',
     category: 'Seating',
   },
   { 
     id: '2', 
     name: 'Minimalist Coffee Table', 
     price: 649, 
     x: 48, 
     y: 72, 
     store: 'West Elm',
     matchScore: 88,
     reason: 'Low profile maintains sightlines to the window. Marble top reflects natural light, brightening the central space.',
     category: 'Tables',
   },
   { 
     id: '3', 
     name: 'Arc Floor Lamp', 
     price: 299, 
     x: 78, 
     y: 38, 
     store: 'CB2',
     matchScore: 96,
     reason: 'Provides ambient lighting for the reading corner. Arc design doesn\'t compete with the window view.',
     category: 'Lighting',
   },
   { 
     id: '4', 
     name: 'Velvet Modular Sofa', 
     price: 2499, 
     x: 52, 
     y: 52, 
     store: 'Article',
     matchScore: 91,
     reason: 'Sectional configuration maximizes seating in the L-shaped arrangement. Velvet adds warmth without overwhelming.',
     category: 'Seating',
   },
];

const aiSuggestions = [
  'Try Scandinavian style',
  'Replace sofa with sectional',
  'Add warm lighting',
  'Bohemian accent pieces',
  'Minimalist arrangement',
];

export const AICanvas = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
   const [hotspotsRevealed, setHotspotsRevealed] = useState(false);
   const [isAnyHotspotHovered, setIsAnyHotspotHovered] = useState(false);
   const [currentStyle, setCurrentStyle] = useState('scandinavian');
   const [isRecalibrating, setIsRecalibrating] = useState(false);

  // Rotate AI suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % aiSuggestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
 
   // Reveal hotspots with staggered animation after initial load
   useEffect(() => {
     const timer = setTimeout(() => {
       setHotspotsRevealed(true);
     }, 1200);
     return () => clearTimeout(timer);
   }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommand = (command: string) => {
    setAiThinking(true);
    setTimeout(() => {
      setAiThinking(false);
       // Trigger recalibration effect
       setIsRecalibrating(true);
       setTimeout(() => setIsRecalibrating(false), 2000);
    }, 2000);
    setCommandOpen(false);
     
     // Update style based on command
     if (command.toLowerCase().includes('scandinavian')) setCurrentStyle('scandinavian');
     else if (command.toLowerCase().includes('modern')) setCurrentStyle('modern');
     else if (command.toLowerCase().includes('bohemian')) setCurrentStyle('bohemian');
     else if (command.toLowerCase().includes('minimalist')) setCurrentStyle('minimalist');
  };
 
   const handleHotspotHover = useCallback((isHovered: boolean) => {
     setIsAnyHotspotHovered(isHovered);
   }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-charcoal">
       {/* Living ambient background */}
       <AmbientBackground />

      {/* Navigation Rail - Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute left-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2"
      >
        {[
          { icon: Layers, label: 'Rooms', active: true },
          { icon: Palette, label: 'Styles' },
          { icon: Sofa, label: 'Furniture' },
          { icon: Lightbulb, label: 'Lighting' },
        ].map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
              item.active 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:bg-white/5 hover:text-white/70'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.active && (
              <motion.div
                layoutId="activeNav"
                className="absolute -left-1 h-8 w-1 rounded-full bg-primary"
              />
            )}
            <span className="absolute left-full ml-3 whitespace-nowrap rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Main Canvas Area */}
      <div className="relative flex h-full items-center justify-center px-20 py-16">
        {/* Room Image Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative h-full max-h-[75vh] w-full max-w-[75vw]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glow effect behind image */}
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-ai-amber/20 via-ai-coral/10 to-ai-purple/20 blur-3xl" />
          
          {/* Main image */}
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10">
            <AnimatePresence mode="wait">
              <motion.img
                key={viewMode}
                src={viewMode === 'after' 
                  ? "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=90"
                  : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=90"
                }
                alt="AI Designed Living Room"
                className="h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

             {/* Intelligent product hotspots */}
             {intelligentProducts.map((product, index) => (
               <IntelligentHotspot
                 key={product.id}
                 product={product}
                 index={index}
                 isRevealed={hotspotsRevealed && !aiThinking}
                 isSelected={selectedProduct === product.id}
                 onSelect={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                 onHover={handleHotspotHover}
                 isAnyHovered={isAnyHotspotHovered}
               />
             ))}

            {/* AI Thinking overlay */}
            <AnimatePresence>
              {aiThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-charcoal">
                        <Wand2 className="h-6 w-6 text-white" />
                      </div>
                    </motion.div>
                    <p className="font-medium text-white">AI is redesigning your space...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Before/After slider control */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2">
              <div className="flex overflow-hidden rounded-2xl bg-charcoal/80 p-1 backdrop-blur-xl">
                <button
                  onClick={() => setViewMode('before')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'before' 
                      ? 'bg-white text-charcoal' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Before
                </button>
                <button
                  onClick={() => setViewMode('after')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'after' 
                      ? 'bg-white text-charcoal' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  After
                </button>
              </div>
            </div>

            {/* Fullscreen button */}
            <button className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal/80 text-white/60 backdrop-blur-xl transition-colors hover:bg-charcoal hover:text-white">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>

          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-ai-amber via-ai-coral to-ai-purple px-5 py-2 shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-sm font-semibold text-white">AI Designed</span>
          </motion.div>
        </motion.div>
      </div>

      {/* AI Inspector Panel - Right */}
      <AnimatePresence>
        {showInspector && (
          <AIInspectorPanel 
            onClose={() => setShowInspector(false)}
            selectedProduct={selectedProduct}
            onClearProduct={() => setSelectedProduct(null)}
             isRecalibrating={isRecalibrating}
          />
        )}
      </AnimatePresence>
 
       {/* AI Voice - contextual observations */}
       <AIVoice
         selectedProduct={selectedProduct}
         currentStyle={currentStyle}
         isAnalyzing={aiThinking}
       />

      {/* Command Bar - Bottom */}
      <AICommandBar
        isOpen={commandOpen}
        onOpenChange={setCommandOpen}
        currentSuggestion={aiSuggestions[currentSuggestion]}
        onCommand={handleCommand}
      />

      {/* Quick Actions - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-24 right-8 z-30 flex flex-col gap-3"
      >
        <Link to="/designer">
          <Button
            size="lg"
            className="group gap-2 rounded-2xl bg-gradient-to-r from-primary via-ai-coral to-ai-purple px-6 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-glow"
          >
            <Upload className="h-5 w-5" />
            Upload Your Room
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowInspector(!showInspector)}
          className="gap-2 rounded-2xl border-white/20 bg-white/5 px-6 font-semibold text-white backdrop-blur-xl hover:bg-white/10 hover:text-white"
        >
          <Sparkles className="h-5 w-5" />
          {showInspector ? 'Hide' : 'Show'} AI Inspector
        </Button>
      </motion.div>

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 text-white/40"
      >
        <kbd className="flex h-6 items-center rounded-md border border-white/20 bg-white/5 px-2 font-mono text-xs">
          /
        </kbd>
        <span className="text-sm">to open AI commands</span>
      </motion.div>
    </section>
  );
};
