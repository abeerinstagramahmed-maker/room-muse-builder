import { AICanvas } from '@/components/canvas/AICanvas';
import { AIJourneySection } from '@/components/home/AIJourneySection';
import { ProductDiscoverySection } from '@/components/home/ProductDiscoverySection';
import { TrustSection } from '@/components/home/TrustSection';
import { AIRevealSection } from '@/components/home/AIRevealSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Floating Header for Canvas */}
      <Header variant="canvas" />
      
      {/* AI Canvas - Full screen hero that IS the interface */}
      <AICanvas />
      
      {/* AI Journey - Guided explanation of the system */}
      <AIJourneySection />

      {/* Product Discovery - Spotlight cards, not store grid */}
      <ProductDiscoverySection />
      
      {/* Trust indicators */}
      <TrustSection />
      
      {/* AI Reveal CTA - Not a traditional CTA, an experience */}
      <AIRevealSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
