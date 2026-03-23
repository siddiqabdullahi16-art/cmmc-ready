import Link from "next/link";
import { Shield } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-neutral-400 mb-8">Last updated: March 23, 2026</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
        <p className="text-neutral-300 leading-relaxed">By accessing or using CMMC-Ready (&quot;the Service&quot;), operated by CMMC-Ready (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. Description of Service</h2>
        <p className="text-neutral-300 leading-relaxed">CMMC-Ready provides a self-assessment compliance platform designed to help defense contractors evaluate their readiness for CMMC (Cybersecurity Maturity Model Certification). The Service includes gap analysis tools, evidence tracking, report generation, and team collaboration features.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Disclaimer</h2>
        <p className="text-neutral-300 leading-relaxed">CMMC-Ready is a compliance preparation tool. We are NOT a CMMC Third-Party Assessment Organization (C3PAO) and do NOT provide official CMMC certification. Use of this platform does not guarantee CMMC certification. Users should consult with qualified CMMC assessors and legal counsel for official compliance determinations.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. Account Registration</h2>
        <p className="text-neutral-300 leading-relaxed">You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must notify us immediately of any unauthorized use.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Subscription & Billing</h2>
        <p className="text-neutral-300 leading-relaxed">Paid subscriptions are billed monthly. You may cancel at any time; cancellation takes effect at the end of the current billing period. We reserve the right to change pricing with 30 days notice. Refunds are provided at our discretion.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">6. Data Ownership</h2>
        <p className="text-neutral-300 leading-relaxed">You retain ownership of all data you upload to the Service, including assessment responses, evidence files, and reports. We do not sell, share, or use your data for purposes other than providing the Service.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">7. Acceptable Use</h2>
        <p className="text-neutral-300 leading-relaxed">You agree not to: (a) use the Service for unlawful purposes; (b) attempt to gain unauthorized access to other accounts or systems; (c) interfere with the operation of the Service; (d) share your account with unauthorized parties.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">8. Limitation of Liability</h2>
        <p className="text-neutral-300 leading-relaxed">To the maximum extent permitted by law, CMMC-Ready shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">9. Changes to Terms</h2>
        <p className="text-neutral-300 leading-relaxed">We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. We will notify registered users of material changes via email.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">10. Contact</h2>
        <p className="text-neutral-300 leading-relaxed">Questions about these Terms? Contact us at support@cmmcready.pro.</p>
      </div>
    </div>
  );
}
