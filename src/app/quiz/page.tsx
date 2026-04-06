"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const QUIZ_QUESTIONS = [
  { q: "Do all employees have unique login credentials (no shared accounts)?", weight: 10 },
  { q: "Is multi-factor authentication (MFA) enabled for email and VPN?", weight: 12 },
  { q: "Do you have a written cybersecurity policy?", weight: 8 },
  { q: "Is all sensitive data encrypted in storage and during transmission?", weight: 12 },
  { q: "Do you conduct annual security awareness training?", weight: 8 },
  { q: "Are all systems patched and updated regularly?", weight: 10 },
  { q: "Do you have antivirus/endpoint protection on all devices?", weight: 8 },
  { q: "Is there a documented incident response plan?", weight: 10 },
  { q: "Are physical access controls in place for server rooms?", weight: 8 },
  { q: "Do you maintain audit logs of user activity?", weight: 14 },
];

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(new Array(QUIZ_QUESTIONS.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);

  const [saving, setSaving] = useState(false);

  function answer(yes: boolean) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = yes;
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
    }
  }

  async function captureLeadAndShow(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "quiz",
          score,
          answers: answers.map((a, i) => ({ question: QUIZ_QUESTIONS[i].q, answer: a })),
        }),
      });
    } catch {
      // Still show results even if save fails
    }
    setSaving(false);
    setCaptured(true);
  }

  const yesCount = answers.filter((a) => a === true).length;
  const score = Math.round(answers.reduce((sum, a, i) => sum + (a ? QUIZ_QUESTIONS[i].weight : 0), 0));

  const level =
    score >= 80 ? { label: "Strong Foundation", color: "text-emerald-400", desc: "You have a solid security baseline. With targeted improvements, you could be assessment-ready soon." } :
    score >= 50 ? { label: "Moderate Readiness", color: "text-amber-400", desc: "You have some controls in place but significant gaps remain. A structured assessment plan will get you on track." } :
    { label: "Early Stage", color: "text-red-400", desc: "Your organization needs substantial security improvements before pursuing CMMC certification. Start with the fundamentals." };

  if (showResults && !captured) {
    return (
      <div className="min-h-screen bg-[var(--background)] grid-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Shield className="w-10 h-10 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your results are ready!</h2>
          <p className="text-neutral-400 mb-6 text-sm">Enter your email to see your CMMC readiness score and personalized recommendations.</p>
          <form onSubmit={captureLeadAndShow} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="flex h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <Button type="submit" size="lg" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "See My Results"}
            </Button>
          </form>
          <p className="text-xs text-neutral-600 mt-3">We&apos;ll send you a detailed breakdown. No spam.</p>
        </div>
      </div>
    );
  }

  if (captured) {
    return (
      <div className="min-h-screen bg-[var(--background)] grid-bg">
        <nav className="border-b border-white/[0.06] px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
            </Link>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className={`text-7xl font-bold mb-2 ${level.color}`}>{score}%</div>
          <Badge variant={score >= 80 ? "success" : score >= 50 ? "warning" : "danger"} className="mb-4">
            {level.label}
          </Badge>
          <p className="text-neutral-400 mb-8">{level.desc}</p>

          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Your Answers</h3>
              <div className="space-y-2">
                {QUIZ_QUESTIONS.map((qq, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={answers[i] ? "text-emerald-400" : "text-red-400"}>
                      {answers[i] ? "✓" : "✗"}
                    </span>
                    <span className="text-neutral-400">{qq.q}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Get Your Full Assessment</h3>
              <p className="text-sm text-neutral-400 mb-4">
                This quiz covered 10 high-level questions. The full CMMC Level 2 assessment includes 110 specific controls with remediation guidance, evidence tracking, and audit-ready reports.
              </p>
              <div className="space-y-2 mb-5">
                {["Detailed gap analysis across 14 domains", "Step-by-step remediation guidance", "Professional PDF reports for auditors"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-neutral-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    {t}
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/auth/signup">
                  Start Full Assessment Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-neutral-500 mt-2">14-day free trial. No charge until day 15.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Free CMMC Readiness Quiz</h1>
          <p className="text-neutral-400 text-sm">10 questions. 2 minutes. See where you stand.</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-neutral-500 mb-2">
            <span>Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{yesCount} yes</span>
          </div>
          <div className="w-full bg-white/[0.05] rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <p className="text-lg font-medium leading-relaxed">{QUIZ_QUESTIONS[currentQ].q}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => answer(true)}
            className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-center"
          >
            <span className="text-lg font-semibold text-emerald-400">Yes</span>
          </button>
          <button
            onClick={() => answer(false)}
            className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-red-500/40 hover:bg-red-500/5 transition-all text-center"
          >
            <span className="text-lg font-semibold text-red-400">No</span>
          </button>
        </div>
      </div>
    </div>
  );
}
