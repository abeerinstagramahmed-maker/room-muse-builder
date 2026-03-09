import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Sparkles, Heart, Zap, Users } from 'lucide-react';

const values = [
  { icon: Sparkles, title: 'AI-First Design', description: 'We believe artificial intelligence can make beautiful interior design accessible to everyone, not just those who can afford a designer.' },
  { icon: Heart, title: 'Customer Obsessed', description: 'Every feature we build starts with a real customer need. Your room, your style, your budget — we design around you.' },
  { icon: Zap, title: 'Instant Inspiration', description: 'No more endless scrolling. Upload a photo of your room and get curated, shoppable design ideas in seconds.' },
  { icon: Users, title: 'Community Driven', description: 'We partner with furniture makers and brands worldwide to bring you quality products at fair prices.' },
];

export default function About() {
  return (
    <Layout>
      <SEOHead title="About Roomly – AI Interior Design" description="Learn about Roomly's mission to make beautiful interior design accessible to everyone through AI technology." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Making Beautiful Spaces<br />
            <span className="text-primary">Accessible to Everyone</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Roomly combines AI technology with curated furniture from trusted vendors to help you design and furnish your dream space — no interior designer required.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container max-w-3xl py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold">Our Story</h2>
        <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Roomly was born from a simple frustration: why is it so hard to furnish a room that actually looks good? Hiring an interior designer is expensive, and browsing thousands of products online is overwhelming.
          </p>
          <p>
            We set out to build something different — an AI-powered platform that understands your room, your style, and your budget, then recommends furniture that actually works together. No guesswork, no design degree needed.
          </p>
          <p>
            Today, Roomly helps thousands of customers transform their spaces with confidence. From living rooms to bedrooms, our AI analyzes your space and curates personalized product suggestions you can shop instantly.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">What We Stand For</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-background p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
