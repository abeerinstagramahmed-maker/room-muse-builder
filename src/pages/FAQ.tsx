import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How does the AI Designer work?', a: 'Upload a photo of your room, choose your style preferences and budget, and our AI analyzes the space to recommend furniture and decor that fits perfectly. You can shop the entire look instantly.' },
  { q: 'Is the AI Designer free?', a: 'You get 1 free design. After that, upgrade to our Pro plan for unlimited AI designs, priority support, and exclusive collections.' },
  { q: 'Where do the products come from?', a: 'We source products from trusted US furniture retailers including major brands and boutique stores. All products are curated for quality and style.' },
  { q: 'How long does shipping take?', a: 'Shipping times vary by product and vendor, typically 3-14 business days for standard delivery within the US. Free shipping on orders over $100.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy on most items. Products must be in original condition and packaging. See our Returns page for full details.' },
  { q: 'Can I save my designs?', a: 'Yes! Sign in to save unlimited designs to your account. You can revisit and shop from them anytime.' },
  { q: 'Do you offer design consultations?', a: 'Our Pro plan includes AI-powered design recommendations. For personalized human consultation, contact our support team.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number via email. You can also view order status in your Account page under "My Orders".' },
];

const FAQ = () => (
  <Layout>
    <SEOHead title="FAQ" description="Frequently asked questions about Roomly's AI interior design platform, shipping, returns, and more." />
    <div className="container max-w-3xl py-12 md:py-20">
      <h1 className="font-display text-4xl font-bold">Frequently Asked Questions</h1>
      <p className="mt-3 text-muted-foreground">Everything you need to know about Roomly</p>
      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </Layout>
);

export default FAQ;
