import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, ShoppingBag, Wand2 } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Room',
    description: 'Take a photo of any room you want to redesign',
  },
  {
    icon: Wand2,
    title: 'AI Creates Magic',
    description: 'Our AI analyzes your space and suggests the perfect pieces',
  },
  {
    icon: ShoppingBag,
    title: 'Shop the Look',
    description: 'Add the entire room to cart with one click',
  },
];

export const AIDesignerPromo = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-sage/10">
          <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
            {/* Content */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                New Feature
              </div>
              
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Meet Your Personal
                <br />
                AI Interior Designer
              </h2>
              
              <p className="mt-4 text-lg text-muted-foreground">
                Upload a photo of your room and let our AI create a stunning design using furniture from our catalog. It's like having a professional interior designer in your pocket.
              </p>

              {/* Steps */}
              <div className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/designer" className="mt-8 inline-block">
                <Button size="lg" variant="hero" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Try AI Designer Free
                </Button>
              </Link>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                  alt="AI-designed living room"
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Before/After Badge */}
              <div className="absolute -right-4 -top-4 rounded-full bg-sage px-4 py-2 text-sm font-semibold text-sage-foreground shadow-lg">
                ✨ AI Designed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
