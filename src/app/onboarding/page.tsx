"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const LEVELS = [
  {
    level: 1,
    title: "Level 1 — Foundational",
    description: "17 practices based on FAR 52.204-21. Required for FCI (Federal Contract Information).",
    controls: 17,
  },
  {
    level: 2,
    title: "Level 2 — Advanced",
    description: "110 practices aligned with NIST SP 800-171. Required for CUI (Controlled Unclassified Information).",
    controls: 110,
    recommended: true,
  },
  {
    level: 3,
    title: "Level 3 — Expert",
    description: "110+ practices with enhanced requirements from NIST SP 800-172. For highest-priority programs.",
    controls: 130,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [targetLevel, setTargetLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in. Please sign in and try again.");
        setLoading(false);
        return;
      }

      // Check if org already exists for this user
      const { data: existing } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      let orgId = existing?.org_id;

      if (!orgId) {
        // Create org
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert({ name: orgName || "My Organization" })
          .select()
          .single();

        if (orgError) {
          setError("Failed to create organization. Please try again.");
          setLoading(false);
          return;
        }

        if (org) {
          orgId = org.id;
          const { error: memberError } = await supabase.from("org_members").insert({
            org_id: org.id,
            user_id: user.id,
            role: "owner",
          });

          if (memberError) {
            setError("Failed to set up your membership. Please try again.");
            setLoading(false);
            return;
          }
        }
      } else if (orgName) {
        await supabase
          .from("organizations")
          .update({ name: orgName })
          .eq("id", orgId);
      }

      if (orgId) {
        // Check if assessment already exists (avoid duplicates)
        const { data: existingAssessment } = await supabase
          .from("assessments")
          .select("id")
          .eq("org_id", orgId)
          .eq("status", "in_progress")
          .limit(1)
          .single();

        if (!existingAssessment) {
          await supabase.from("assessments").insert({
            org_id: orgId,
            name: `CMMC Level ${targetLevel} Assessment`,
            target_level: targetLevel,
          });
        }
      }

      window.location.href = "/pricing";
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold">
            <span className="text-[var(--primary)]">CMMC</span>-Ready
          </span>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 rounded-full transition ${
                  s <= step ? "bg-[var(--primary)]" : "bg-[var(--card-border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
            <h2 className="text-xl font-bold mb-2">Welcome! Let&apos;s get started.</h2>
            <p className="text-[var(--muted)] text-sm mb-6">
              First, confirm your organization name.
            </p>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Defense Corp"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!orgName.trim()}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3 rounded-lg transition disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8">
            <h2 className="text-xl font-bold mb-2">Select your CMMC target level</h2>
            <p className="text-[var(--muted)] text-sm mb-6">
              Choose the level required by your DoD/DoW contracts.
            </p>
            <div className="space-y-3 mb-6">
              {LEVELS.map((l) => (
                <button
                  key={l.level}
                  onClick={() => setTargetLevel(l.level)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    targetLevel === l.level
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{l.title}</span>
                    {l.recommended && (
                      <span className="text-xs bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
                        Most Common
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)]">{l.description}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{l.controls} controls</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-[var(--card-border)] py-3 rounded-lg text-sm hover:bg-[var(--background)] transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3 rounded-lg transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-xl font-bold mb-2">Almost there!</h2>
            <p className="text-[var(--muted)] text-sm mb-2">
              <strong>{orgName}</strong> — CMMC Level {targetLevel}
            </p>
            <p className="text-[var(--muted)] text-sm mb-6">
              We&apos;ll create your assessment with{" "}
              {LEVELS.find((l) => l.level === targetLevel)?.controls} controls.
              Next, choose a plan to activate your 14-day free trial.
            </p>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3 rounded-lg transition disabled:opacity-50 mb-3"
            >
              {loading ? "Setting up..." : "Choose Plan & Start Trial"}
            </button>
            <button
              onClick={() => setStep(2)}
              className="text-[var(--muted)] text-sm hover:text-white transition"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
