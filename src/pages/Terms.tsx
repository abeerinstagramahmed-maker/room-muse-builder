import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';

export default function Terms() {
  return (
    <Layout>
      <SEOHead title="Terms of Service – Roomly" description="Roomly's terms of service. Read the terms governing the use of our platform." />
      <div className="container max-w-3xl py-16 md:py-24">
        <h1 className="font-display text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: March 9, 2026</p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Roomly, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">2. Account Registration</h2>
            <p className="text-muted-foreground">
              You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">3. Orders & Payments</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>All prices are displayed in USD unless otherwise noted.</li>
              <li>Payment is processed securely through Stripe at checkout.</li>
              <li>We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud.</li>
              <li>Orders are fulfilled through our network of vendor partners.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">4. AI Design Service</h2>
            <p className="text-muted-foreground">
              Our AI-powered room designer provides suggestions based on your uploaded images and preferences. Designs are generated for inspiration purposes. Actual product appearance may vary.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">5. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on Roomly, including designs, logos, and text, is owned by Roomly or its licensors. You retain ownership of any images you upload.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Roomly is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms at any time. Continued use of Roomly after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
