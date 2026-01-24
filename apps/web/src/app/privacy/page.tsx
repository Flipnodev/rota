import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PageFooter } from "@/components/page-footer";

export const metadata: Metadata = {
  title: "Privacy Policy - ROTA",
  description: "Privacy policy for the ROTA workout app.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PageHeader />

      <article className="relative z-10 px-6 py-16 max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-zinc-500">Last updated: January 23, 2026</p>
        </header>

        <div className="prose prose-invert prose-zinc max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Overview</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              ROTA (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our
              mobile application and website.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              We believe in data minimization. We only collect what&apos;s necessary to provide you with a
              great training experience.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>

            <h3 className="text-lg font-medium mb-3 text-zinc-200">Account Information</h3>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-6">
              <li>Email address (for account creation and communication)</li>
              <li>Password (encrypted, never stored in plain text)</li>
              <li>Profile preferences (training goals, experience level)</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-zinc-200">Workout Data</h3>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-6">
              <li>Exercise logs (sets, reps, weights)</li>
              <li>Workout history and completion dates</li>
              <li>Program selections and progress</li>
            </ul>

            <h3 className="text-lg font-medium mb-3 text-zinc-200">Technical Data</h3>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Device type and operating system</li>
              <li>App version</li>
              <li>Crash reports and performance data</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>To provide and maintain the ROTA service</li>
              <li>To track your workout progress and suggest improvements</li>
              <li>To send important updates about your account or the service</li>
              <li>To improve our app based on usage patterns</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Storage & Security</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Your data is stored securely using industry-standard encryption. We use Supabase for our
              backend infrastructure, which provides enterprise-grade security including:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Encryption in transit (TLS/SSL)</li>
              <li>Encryption at rest</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Sharing</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Service providers who assist in operating our app (hosting, analytics)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Rights (GDPR)</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              If you&apos;re in the European Economic Area, you have the right to:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Object to data processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Retention</h2>
            <p className="text-zinc-400 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account,
              we will delete your personal data within 30 days, except where we&apos;re required to
              retain it for legal purposes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">Changes to This Policy</h2>
            <p className="text-zinc-400 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="text-zinc-400 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@rota.app" className="text-white hover:underline">
                privacy@rota.app
              </a>
            </p>
          </section>
        </div>
      </article>

      <PageFooter />
    </main>
  );
}
