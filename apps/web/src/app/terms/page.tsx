import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PageFooter } from "@/components/page-footer";

export const metadata: Metadata = {
  title: "Terms of Service - ROTA",
  description: "Terms of service for the ROTA workout app.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PageHeader />

      <article className="relative z-10 px-6 py-16 max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-zinc-500">Last updated: January 23, 2026</p>
        </header>

        <div className="prose prose-invert prose-zinc max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              By accessing or using ROTA (&ldquo;the Service&rdquo;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              ROTA is a workout tracking and programming application that helps users:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Follow structured training programs</li>
              <li>Log workout sessions and track progress</li>
              <li>Access exercise libraries and instructions</li>
              <li>View workout history and statistics</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Subscription & Payments</h2>

            <h3 className="text-lg font-medium mb-3 text-zinc-200">Free Tier</h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              ROTA offers a free tier with limited features. No payment is required for the free tier.
            </p>

            <h3 className="text-lg font-medium mb-3 text-zinc-200">Premium Subscription</h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Premium features require a paid subscription. By subscribing, you agree that:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-4">
              <li>Subscriptions are billed in advance on a recurring basis</li>
              <li>You authorize us to charge your payment method automatically</li>
              <li>Prices may change with 30 days notice</li>
              <li>Refunds are handled according to Apple App Store / Google Play policies</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-zinc-200">Cancellation</h3>
            <p className="text-zinc-400 leading-relaxed">
              You may cancel your subscription at any time through your device&apos;s app store settings.
              Cancellation takes effect at the end of the current billing period.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Acceptable Use</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Reverse engineer or decompile the application</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the Service</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Health Disclaimer</h2>
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 mb-4">
              <p className="text-zinc-300 leading-relaxed">
                <strong>Important:</strong> ROTA is not a medical device and does not provide medical advice.
                The workout programs and guidance provided are for informational purposes only.
              </p>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>You should consult a physician before starting any exercise program</li>
              <li>You exercise at your own risk</li>
              <li>ROTA is not responsible for any injuries resulting from workouts</li>
              <li>You are responsible for using appropriate weights and proper form</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Intellectual Property</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by ROTA
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              You retain ownership of any workout data you create. By using the Service, you grant us
              a license to use this data to provide and improve the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Limitation of Liability</h2>
            <p className="text-zinc-400 leading-relaxed">
              To the maximum extent permitted by law, ROTA shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of data,
              profits, or goodwill, arising from your use of the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Termination</h2>
            <p className="text-zinc-400 leading-relaxed">
              We may terminate or suspend your account at any time, without prior notice, for conduct
              that we believe violates these Terms or is harmful to other users, us, or third parties,
              or for any other reason at our sole discretion.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Changes to Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of
              significant changes through the app or via email. Your continued use of the Service
              after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Governing Law</h2>
            <p className="text-zinc-400 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Norway,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact</h2>
            <p className="text-zinc-400 leading-relaxed">
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@rota.app" className="text-white hover:underline">
                legal@rota.app
              </a>
            </p>
          </section>
        </div>
      </article>

      <PageFooter />
    </main>
  );
}
