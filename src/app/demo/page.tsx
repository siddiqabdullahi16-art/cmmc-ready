"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Lock } from "lucide-react";

const DEMO_QUESTIONS = [
  { id: "AC.L1-3.1.1", domain: "Access Control", question: "Do you limit system access to only authorized users?", guidance: "Implement user account management procedures. Use Active Directory or similar to manage access." },
  { id: "IA.L2-3.5.3", domain: "Identification & Authentication", question: "Is multi-factor authentication enabled for all accounts?", guidance: "Deploy MFA solution (Microsoft Authenticator, Duo, etc.) for all users." },
  { id: "SC.L2-3.13.8", domain: "System & Communications Protection", question: "Is CUI encrypted during transmission?", guidance: "Enforce TLS 1.2+ for all communications. Use VPN for sensitive transfers." },
  { id: "SI.L1-3.14.2", domain: "System & Information Integrity", question: "Do you have anti-malware on all systems?", guidance: "Deploy endpoint protection on all systems. Keep signatures current." },
  { id: "AU.L2-3.3.1", domain: "Audit & Accountability", question: "Do you maintain audit logs for all systems?", guidance: "Enable audit logging on all systems. Retain logs for at least 1 year." },
];

type Answer = "met" | "not_met" | "partially_met" | null;

export default function DemoPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(new Array(DEMO_QUESTIONS.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const q = DEMO_QUESTIONS[currentQ];
  const answered = answers.filter((a) => a !== null).length;
  const met = answers.filter((a) => a === "met").length;
  const score = answered > 0 ? Math.round((met / DEMO_QUESTIONS.length) * 100) : 0;

  function answer(status: Answer) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = status;
    setAnswers(newAnswers);

    if (currentQ < DEMO_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
    }
  }

  if (showResults) {
    const notMet = answers.filter((a) => a === "not_met").length;
    const partial = answers.filter((a) => a === "partially_met").length;

    return (
      <div className="min-h-screen bg-[var(--background)] grid-bg">
        <nav className="border-b border-white/[0.06] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
            </Link>
            <Badge>Demo Mode</Badge>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="text-6xl font-bold mb-2">{score}%</div>
          <p className="text-neutral-400 mb-8">Estimated CMMC Readiness (based on 5 sample controls)</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-emerald-400">{met}</div>
                <div className="text-xs text-neutral-500">Met</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-red-400">{notMet}</div>
                <div className="text-xs text-neutral-500">Gaps</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-amber-400">{partial}</div>
                <div className="text-xs text-neutral-500">Partial</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <Lock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">This was just 5 of 110 controls</h3>
              <p className="text-sm text-neutral-400 mb-4">
                The full CMMC Level 2 assessment covers 110 controls across 14 security domains.
                Sign up to get your complete readiness score, gap analysis, remediation guidance, and audit-ready reports.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href="/auth/signup">
                  Start Full Assessment Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-neutral-500 mt-3">14-day free trial. No credit card required.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg">
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
          </Link>
          <Badge>Demo Mode — {currentQ + 1}/{DEMO_QUESTIONS.length}</Badge>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="w-full bg-white/[0.05] rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentQ + 1) / DEMO_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <Badge variant="default" className="mb-4">{q.domain}</Badge>

        <Card className="mb-6">
          <CardContent className="p-8">
            <p className="text-xs text-neutral-500 mb-2 font-mono">{q.id}</p>
            <h2 className="text-xl font-semibold mb-2">{q.question}</h2>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => answer("met")}
            className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-emerald-500/40 transition-all text-center"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-sm font-medium">Yes, Met</span>
          </button>
          <button
            onClick={() => answer("partially_met")}
            className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-amber-500/40 transition-all text-center"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <span className="text-sm font-medium">Partially</span>
          </button>
          <button
            onClick={() => answer("not_met")}
            className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-red-500/40 transition-all text-center"
          >
            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <span className="text-sm font-medium">No, Not Met</span>
          </button>
        </div>

        {answers[currentQ] === "not_met" && (
          <Card className="border-red-500/20">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-red-400 mb-1">Remediation Guidance</p>
              <p className="text-sm text-neutral-400">{q.guidance}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
