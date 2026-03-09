import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';

export default function Cookies() {
  return (
    <Layout>
      <SEOHead title="Cookie Policy – Roomly" description="Learn about the cookies Roomly uses and how to manage your preferences." />
      <div className="container max-w-3xl py-16 md:py-24">
        <h1 className="font-display text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: March 9, 2026</p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold">What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and login state.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 text-left font-semibold">Cookie</th>
                    <th className="py-2 pr-4 text-left font-semibold">Purpose</th>
                    <th className="py-2 text-left font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">sb-*-auth-token</td>
                    <td className="py-2 pr-4">Authentication session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">theme</td>
                    <td className="py-2 pr-4">Dark/light mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">i18nextLng</td>
                    <td className="py-2 pr-4">Language preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Managing Cookies</h2>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings. Disabling essential cookies may affect the functionality of our website, including login and checkout.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Third-Party Cookies</h2>
            <p className="text-muted-foreground">
              Our payment processor (Stripe) may set cookies during checkout for fraud prevention. These are governed by Stripe's own privacy and cookie policies.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
