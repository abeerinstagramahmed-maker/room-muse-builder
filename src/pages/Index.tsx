import { Layout } from '@/components/layout/Layout';
import { AICanvas } from '@/components/canvas/AICanvas';
import { ProductDiscoverySection } from '@/components/home/ProductDiscoverySection';
import { TrustSection } from '@/components/home/TrustSection';
import { AIRevealSection } from '@/components/home/AIRevealSection';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* AI Canvas - Full screen hero that IS the interface */}
      <AICanvas />
      
      {/* Product Discovery - Spotlight cards, not store grid */}
      <ProductDiscoverySection />
      
      {/* Trust indicators */}
      <TrustSection />
      
      {/* AI Reveal CTA - Not a traditional CTA, an experience */}
      <AIRevealSection />
    </div>
  );
};

export default Index;
