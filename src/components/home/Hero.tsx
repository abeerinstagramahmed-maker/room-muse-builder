import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/3 rounded-full bg-terracotta-light blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-sage-light blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid min-h-[85vh] items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          {/* Content */}
          <div className="flex flex-col items-start">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-terracotta-light px-4 py-2 text-sm font-medium text-primary animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Design
            </div>
            
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Design Your Room.
              <br />
              <span className="text-primary">Shop the Look.</span>
            </h1>
            
            <p className="mt-6 max-w-lg text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Upload a photo of your space and let our AI interior designer create a personalized room design. Then shop every piece with one click.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/designer">
                <Button size="xl" variant="hero" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Try AI Designer
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="xl" variant="hero-outline" className="gap-2">
                  Browse Collection
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div>
                <p className="font-display text-3xl font-bold">10k+</p>
                <p className="text-sm text-muted-foreground">Happy homes</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Curated products</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">4.9★</p>
                <p className="text-sm text-muted-foreground">Customer rating</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                alt="Beautiful modern living room"
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -left-4 bottom-8 rounded-2xl bg-background/95 p-4 shadow-lg backdrop-blur-sm md:-left-8 md:p-6 animate-float">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                AI Suggestion
              </p>
              <p className="mt-1 font-display text-lg font-semibold">
                Aria Modular Sofa
              </p>
              <p className="text-primary">$2,499</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
