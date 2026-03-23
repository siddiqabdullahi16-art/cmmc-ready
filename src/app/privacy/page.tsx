import Link from "next/link";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12 prose prose-invert prose-sm">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-neutral-400 mb-8">Last updated: March 23, 2026</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
        <p className="text-neutral-300 leading-relaxed"><strong>Account Information:</strong> Email address, organization name, and password (securely hashed) when you create an account.</p>
        <p className="text-neutral-300 leading-relaxed"><strong>Assessment Data:</strong> Your responses to CMMC assessment questions, notes, and compliance scores.</p>
        <p className="text-neutral-300 leading-relaxed"><strong>Evidence Files:</strong> Documents you upload as evidence for compliance controls.</p>
        <p className="text-neutral-300 leading-relaxed"><strong>Usage Data:</strong> Pages visited, features used, and session duration for service improvement.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
        <p className="text-neutral-300 leading-relaxed">We use your information to: (a) provide and improve the Service; (b) generate compliance reports; (c) send service-related communications; (d) ensure security and prevent fraud. We do NOT sell your data. We do NOT use your compliance data for advertising.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Data Security</h2>
        <p className="text-neutral-300 leading-relaxed">We implement industry-standard security measures including: encryption at rest and in transit (AES-256, TLS 1.3), row-level security in our database, secure authentication with session management, and regular security assessments. All data is hosted on SOC 2 compliant infrastructure (Supabase/AWS).</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Storage & Retention</h2>
        <p className="text-neutral-300 leading-relaxed">Your data is stored in the United States on encrypted servers. We retain your data for the duration of your account. Upon account deletion, we remove your data within 30 days, except where retention is required by law.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Third-Party Services</h2>
        <p className="text-neutral-300 leading-relaxed">We use the following third-party services: Supabase (database & authentication), Vercel (hosting), and Stripe (payment processing). Each operates under their own privacy policies and maintains SOC 2 or equivalent compliance.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
        <p className="text-neutral-300 leading-relaxed">You have the right to: (a) access your data; (b) export your data; (c) correct inaccurate data; (d) delete your account and data; (e) opt out of non-essential communications. Contact support@cmmcready.pro to exercise these rights.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">7. Cookies</h2>
        <p className="text-neutral-300 leading-relaxed">We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">8. Children&apos;s Privacy</h2>
        <p className="text-neutral-300 leading-relaxed">The Service is not directed at children under 18. We do not knowingly collect information from children.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">9. Changes to This Policy</h2>
        <p className="text-neutral-300 leading-relaxed">We will notify you of material changes via email. Continued use after changes constitutes acceptance.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">10. Contact</h2>
        <p className="text-neutral-300 leading-relaxed">Privacy questions? Contact us at support@cmmcready.pro.</p>
      </div>
    </div>
  );
}
