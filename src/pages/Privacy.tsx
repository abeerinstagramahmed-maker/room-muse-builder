import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';

export default function Privacy() {
  return (
    <Layout>
      <SEOHead title="Privacy Policy – Roomly" description="Roomly's privacy policy. Learn how we collect, use, and protect your personal information." />
      <div className="container max-w-3xl py-16 md:py-24">
        <h1 className="font-display text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: March 9, 2026</p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold">1. Information We Collect</h2>
            <p>When you use Roomly, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Account information:</strong> name, email address, and password when you create an account.</li>
              <li><strong>Order information:</strong> shipping address, phone number, and payment details processed securely via Stripe.</li>
              <li><strong>Usage data:</strong> pages visited, features used, and device information to improve our services.</li>
              <li><strong>Room images:</strong> photos you upload for AI design analysis, stored securely and used only for your designs.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Process and fulfill your orders</li>
              <li>Provide AI-powered design recommendations</li>
              <li>Send order status updates and confirmations</li>
              <li>Improve our products and services</li>
              <li>Communicate about new features or promotions (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">3. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share data with trusted third parties solely to operate our services, including payment processors (Stripe), email providers (Resend), and cloud infrastructure providers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">4. Data Security</h2>
            <p className="text-muted-foreground">
              We use industry-standard encryption and security measures to protect your data. Payment information is processed directly by Stripe and never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You may request access to, correction, or deletion of your personal data at any time by contacting us at <a href="/contact" className="text-primary hover:underline">our contact page</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies to maintain your session and preferences. See our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">7. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related inquiries, please visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
