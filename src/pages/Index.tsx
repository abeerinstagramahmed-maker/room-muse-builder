import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { AIShowcaseSection } from '@/components/home/AIShowcaseSection';
import { ShopByRoomSection } from '@/components/home/ShopByRoomSection';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { TrustSection } from '@/components/home/TrustSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <AIShowcaseSection />
      <ShopByRoomSection />
      <FeaturedProductsSection />
      <TrustSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
