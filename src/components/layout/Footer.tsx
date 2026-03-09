import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Facebook, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/catalog' },
    { label: 'Living Room', href: '/catalog?category=living-room' },
    { label: 'Bedroom', href: '/catalog?category=bedroom' },
    { label: 'Dining', href: '/catalog?category=dining' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  support: [
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
  ],
};

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers' as any)
        .insert({ email: email.trim() } as any);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already subscribed!', description: "You're already on our list." });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Subscribed!', description: 'Thanks for joining our newsletter.' });
      }
      setEmail('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai-coral">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Roomly
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Design your dream space with AI-powered interior design. 
              Upload your room, get personalized suggestions, and shop the look instantly.
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-6">
              <p className="mb-3 text-sm font-medium">Stay inspired</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="max-w-[240px] rounded-xl"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="rounded-xl" disabled={subscribing}>
                  {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-display font-semibold">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Roomly. All rights reserved.
          </p>
          
          {/* Social */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </a>
          </div>

          {/* Legal */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
