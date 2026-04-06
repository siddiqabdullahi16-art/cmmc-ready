"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$99",
    period: "/mo",
    description: "For small contractors starting their CMMC journey",
    planKey: "starter",
    features: [
      "CMMC Level 1 Assessment",
      "1 User",
      "Readiness Dashboard",
      "Basic Gap Analysis",
      "Email Support",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/mo",
    description: "For teams pursuing CMMC Level 2 certification",
    planKey: "professional",
    features: [
      "CMMC Level 1 & 2 Assessment",
      "Up to 10 Users",
      "Evidence Tracking",
      "SSP & POA&M PDF Reports",
      "Team Assignment & Tracking",
      "Priority Support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/mo",
    description: "For organizations needing full compliance coverage",
    planKey: "enterprise",
    features: [
      "All CMMC Levels",
      "Unlimited Users",
      "Advanced Reporting",
      "Audit-Ready Export",
      "Custom Integrations",
      "Dedicated Account Manager",
      "White-Label Option",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    setLoading(planKey);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Please sign in first to subscribe.");
        setLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg">
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-neutral-400">Start with a 14-day free trial. No charge until day 15. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.highlighted ? "border-blue-500/50 glow" : ""}>
              {tier.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              )}
              <CardContent className="p-8">
                {tier.highlighted && <Badge className="mb-4">Most Popular</Badge>}
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
                  disabled={loading !== null}
                  onClick={() => handleCheckout(tier.planKey)}
                >
                  {loading === tier.planKey ? "Redirecting..." : "Start Free Trial"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
