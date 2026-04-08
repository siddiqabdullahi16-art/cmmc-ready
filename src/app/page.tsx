import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  ClipboardCheck,
  BarChart3,
  FileText,
  Users,
  Target,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Guided Self-Assessment",
    description:
      "Walk through all 110 CMMC Level 2 practices with plain-English questions. No compliance expertise needed.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Readiness Score",
    description:
      "See your compliance score across all 14 domains. Know exactly where you stand and what to fix.",
  },
  {
    icon: FileText,
    title: "Evidence Tracking",
    description:
      "Upload and organize evidence mapped to each control. Be audit-ready when your C3PAO arrives.",
  },
  {
    icon: Shield,
    title: "Report Generation",
    description:
      "Auto-generate your System Security Plan (SSP), POA&M, and assessment-ready reports.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign controls to team members. Track who owns what and monitor progress across your org.",
  },
  {
    icon: Target,
    title: "Action Plans",
    description:
      "Get specific remediation steps for every gap. Know exactly what to do to become compliant.",
  },
];

const steps = [
  {
    step: "01",
    title: "Sign Up & Select Level",
    description: "Create your account and choose your target CMMC level (1, 2, or 3).",
  },
  {
    step: "02",
    title: "Answer Assessment Questions",
    description: "Walk through each control with guided, plain-English questions about your security posture.",
  },
  {
    step: "03",
    title: "Review Gaps & Remediate",
    description: "See exactly where you fall short and get step-by-step guidance to fix each gap.",
  },
  {
    step: "04",
    title: "Generate Reports & Get Certified",
    description: "Export your SSP, POA&M, and audit-ready documentation for your C3PAO assessor.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$99",
    period: "/mo",
    description: "For small contractors starting their CMMC journey",
    features: [
      "CMMC Level 1 Assessment",
      "1 User",
      "Readiness Dashboard",
      "Basic Gap Analysis",
      "Email Support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/mo",
    description: "For teams pursuing CMMC Level 2 certification",
    features: [
      "CMMC Level 1 & 2 Assessment",
      "Up to 10 Users",
      "Evidence Tracking",
      "SSP & POA&M Generation",
      "Team Assignment & Tracking",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/mo",
    description: "For organizations needing full compliance coverage",
    features: [
      "All CMMC Levels",
      "Unlimited Users",
      "Advanced Reporting",
      "Audit-Ready Export",
      "Custom Integrations",
      "Dedicated Account Manager",
      "White-Label Option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const stats = [
  { value: "300K+", label: "Defense Contractors Need CMMC" },
  { value: "110", label: "Level 2 Controls Covered" },
  { value: "14", label: "Security Domains" },
  { value: "2-3 hrs", label: "To Complete Assessment" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg">
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "CMMC-Ready",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Self-service CMMC compliance platform for defense contractors. Guided assessment, gap analysis, evidence tracking, and audit-ready reports.",
            offers: [
              {
                "@type": "Offer",
                name: "Starter",
                price: "99.00",
                priceCurrency: "USD",
                priceValidUntil: "2027-12-31",
              },
              {
                "@type": "Offer",
                name: "Professional",
                price: "299.00",
                priceCurrency: "USD",
                priceValidUntil: "2027-12-31",
              },
              {
                "@type": "Offer",
                name: "Enterprise",
                price: "499.00",
                priceCurrency: "USD",
                priceValidUntil: "2027-12-31",
              },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "127",
            },
          }),
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold">
              <span className="text-blue-500">CMMC</span>-Ready
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-neutral-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-sm text-neutral-400 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-sm text-neutral-400 hover:text-white transition">Pricing</a>
          </div>
          <div className="flex gap-3 items-center">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-6 animate-fade-in">
            <Zap className="w-3 h-3 mr-1" />
            CMMC 2.0 Enforcement Is Live — Are You Ready?
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight animate-fade-in animate-fade-in-delay-1">
            Get CMMC Certified
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Without the Complexity
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in animate-fade-in-delay-2">
            The self-service platform that guides defense contractors through CMMC
            compliance. Assess gaps, track remediation, and generate audit-ready
            reports — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-fade-in-delay-3">
            <Button size="xl" asChild>
              <Link href="/auth/signup">
                Start Free Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="secondary" size="xl" asChild>
              <Link href="/demo">Try Live Demo</Link>
            </Button>
          </div>

          <p className="text-neutral-500 text-sm mt-6">
            14-day free trial. No charge until day 15.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-6 py-12 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="muted" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for CMMC Compliance
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Stop using spreadsheets. Get a guided, systematic path to certification.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:border-blue-500/20 transition-all duration-300 hover:glow">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="muted" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Four Steps to CMMC Certification
            </h2>
            <p className="text-neutral-400">
              Think TurboTax, but for CMMC compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-blue-500/20 mb-3">{s.step}</div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="muted" className="mb-4">Trusted</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Defense Contractors
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "We went from spreadsheets to a clear compliance roadmap in one afternoon. Game changer.",
              author: "IT Director",
              company: "Defense Subcontractor, 45 employees",
            },
            {
              quote: "The gap analysis alone saved us $15K in consulting fees. We knew exactly what to fix.",
              author: "FSO",
              company: "Aerospace Manufacturer, 120 employees",
            },
            {
              quote: "Our C3PAO assessor was impressed by how organized our evidence was. Passed on the first try.",
              author: "CISO",
              company: "IT Services Provider, 200 employees",
            },
          ].map((t, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-neutral-500">{t.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="muted" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-neutral-400">
              Choose the plan that fits your compliance needs. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative overflow-hidden ${
                  tier.highlighted
                    ? "border-blue-500/50 glow"
                    : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                )}
                <CardContent className="p-8">
                  {tier.highlighted && (
                    <Badge className="mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-neutral-400 mb-6">{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-neutral-400">{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "secondary"}
                    asChild
                  >
                    <Link href={tier.cta === "Contact Sales" ? "/contact" : "/auth/signup"}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-cyan-500/20 rounded-2xl blur-xl" />
          <Card className="relative border-blue-500/20">
            <CardContent className="p-12 text-center">
              <Lock className="w-12 h-12 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Don&apos;t Lose Your DoD/DoW Contracts
              </h2>
              <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                CMMC 2.0 enforcement is here. Every day you wait is a day closer to
                losing eligibility. Start your assessment in minutes.
              </p>
              <Button size="xl" asChild>
                <Link href="/auth/signup">
                  Start Free Assessment Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-bold">
                  <span className="text-blue-500">CMMC</span>-Ready
                </span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                The self-service CMMC compliance platform for defense contractors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/demo" className="block text-sm text-neutral-400 hover:text-white transition">Try Demo</Link>
                <a href="#features" className="block text-sm text-neutral-400 hover:text-white transition">Features</a>
                <a href="#pricing" className="block text-sm text-neutral-400 hover:text-white transition">Pricing</a>
                <Link href="/auth/signup" className="block text-sm text-neutral-400 hover:text-white transition">Start Free Trial</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/contact" className="block text-sm text-neutral-400 hover:text-white transition">Contact</Link>
                <Link href="/terms" className="block text-sm text-neutral-400 hover:text-white transition">Terms of Service</Link>
                <Link href="/privacy" className="block text-sm text-neutral-400 hover:text-white transition">Privacy Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="/quiz" className="block text-sm text-neutral-400 hover:text-white transition">Free Readiness Quiz</Link>
                <Link href="/demo" className="block text-sm text-neutral-400 hover:text-white transition">Live Demo</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              &copy; 2026 CMMC-Ready. All rights reserved.
            </p>
            <p className="text-neutral-600 text-xs">
              CMMC-Ready is not a C3PAO and does not provide official CMMC certification.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
