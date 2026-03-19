import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { PWASection } from '@/components/landing/PWASection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <LandingHero />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <BeforeAfterSection />
        <PWASection />
        <PricingSection />
        <TestimonialsSection />
        <LandingCTA />
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
