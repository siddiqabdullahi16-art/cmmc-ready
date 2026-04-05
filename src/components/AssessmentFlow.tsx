"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Control = {
  id: string;
  domain_id: string;
  title: string;
  description: string;
  level: number;
  assessment_question: string;
  remediation_guidance: string;
  cmmc_domains: { name: string; abbreviation: string };
};

type ResponseMap = Record<string, { status: string; notes: string }>;

const STATUS_OPTIONS = [
  { value: "met", label: "Met", color: "bg-[var(--success)]", description: "This control is fully implemented" },
  { value: "partially_met", label: "Partially Met", color: "bg-[var(--warning)]", description: "This control is partially implemented" },
  { value: "not_met", label: "Not Met", color: "bg-[var(--danger)]", description: "This control is not implemented" },
  { value: "not_applicable", label: "N/A", color: "bg-[var(--muted)]", description: "This control does not apply" },
];

export function AssessmentFlow({
  assessmentId,
  controls,
  existingResponses,
}: {
  assessmentId: string;
  controls: Control[];
  existingResponses: ResponseMap;
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Start at the first unassessed control
    const firstUnassessed = controls.findIndex(
      (c) => !existingResponses[c.id] || existingResponses[c.id].status === "not_assessed"
    );
    return firstUnassessed >= 0 ? firstUnassessed : 0;
  });
  const [responses, setResponses] = useState<ResponseMap>(existingResponses);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notes, setNotes] = useState(existingResponses[controls[0]?.id]?.notes || "");

  const control = controls[currentIndex];
  const currentDomain = control?.cmmc_domains;

  // Group controls by domain for sidebar
  const domains = new Map<string, { name: string; controls: Control[] }>();
  controls.forEach((c) => {
    if (!domains.has(c.domain_id)) {
      domains.set(c.domain_id, { name: c.cmmc_domains.name, controls: [] });
    }
    domains.get(c.domain_id)!.controls.push(c);
  });

  const saveResponse = useCallback(
    async (status: string) => {
      setSaving(true);
      setSaveError("");
      const supabase = createClient();

      const { error } = await supabase.from("assessment_responses").upsert(
        {
          assessment_id: assessmentId,
          control_id: control.id,
          status,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "assessment_id,control_id" }
      );

      if (error) {
        setSaveError("Failed to save. Please check your connection and try again.");
      } else {
        setResponses((prev) => ({
          ...prev,
          [control.id]: { status, notes },
        }));

        // Auto-advance to next
        if (currentIndex < controls.length - 1) {
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          setNotes(responses[controls[nextIndex]?.id]?.notes || "");
        }
      }
      setSaving(false);
    },
    [assessmentId, control, notes, currentIndex, controls, responses]
  );

  const progress = Object.values(responses).filter(
    (r) => r.status !== "not_assessed"
  ).length;

  if (!control) return null;

  const STATUS_STYLES: Record<string, { dot: string; selectedBorder: string; selectedBg: string; selectedText: string; glow: string }> = {
    met: {
      dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]",
      selectedBorder: "border-emerald-400/50",
      selectedBg: "bg-gradient-to-br from-emerald-500/15 to-emerald-600/5",
      selectedText: "text-emerald-300",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    },
    partially_met: {
      dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]",
      selectedBorder: "border-amber-400/50",
      selectedBg: "bg-gradient-to-br from-amber-500/15 to-amber-600/5",
      selectedText: "text-amber-300",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    },
    not_met: {
      dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]",
      selectedBorder: "border-red-400/50",
      selectedBg: "bg-gradient-to-br from-red-500/15 to-red-600/5",
      selectedText: "text-red-300",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    },
    not_applicable: {
      dot: "bg-slate-400",
      selectedBorder: "border-slate-400/50",
      selectedBg: "bg-gradient-to-br from-slate-500/15 to-slate-600/5",
      selectedText: "text-slate-300",
      glow: "shadow-[0_0_20px_rgba(148,163,184,0.15)]",
    },
  };

  const progressPct = ((currentIndex + 1) / controls.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-white">
            Question <span className="font-mono text-blue-300">{currentIndex + 1}</span>{" "}
            <span className="text-slate-500">of {controls.length}</span>
          </span>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            {progress} answered
          </span>
        </div>
        <div className="relative w-full bg-black/30 border border-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Domain Badge */}
      <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-4">
        <span className="font-mono">{currentDomain?.abbreviation}</span>
        <span className="text-blue-300/40">—</span>
        <span>{currentDomain?.name}</span>
      </div>

      {/* Control Card — glass with gradient border */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
          <h2 className="text-xl font-semibold text-white tracking-tight">{control.title}</h2>
          <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md shrink-0">
            {control.id}
          </span>
        </div>
        <p className="text-slate-100 text-base leading-relaxed mb-4 mt-4">{control.assessment_question}</p>
        <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">{control.description}</p>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4 backdrop-blur-sm">
          {saveError}
        </div>
      )}

      {/* Response Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = responses[control.id]?.status === opt.value;
          const style = STATUS_STYLES[opt.value];
          return (
            <button
              key={opt.value}
              onClick={() => saveResponse(opt.value)}
              disabled={saving}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? `${style.selectedBorder} ${style.selectedBg} ${style.glow}`
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-0.5"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mb-2 ${style.dot}`} />
              <p className={`font-semibold text-sm mb-0.5 ${isSelected ? style.selectedText : "text-white"}`}>{opt.label}</p>
              <p className="text-xs text-slate-400 leading-snug">{opt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Notes <span className="text-slate-600 normal-case">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document implementation details, responsible parties, evidence references..."
          className="w-full bg-[#0f1524] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 min-h-[90px] resize-y transition-all"
        />
      </div>

      {/* Remediation Guidance (shown for not_met) */}
      {responses[control.id]?.status === "not_met" && (
        <div className="relative rounded-xl p-6 mb-6 border border-red-500/20 bg-gradient-to-br from-red-500/8 to-red-600/3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-red-300">Remediation Guidance</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{control.remediation_guidance}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              const prevIndex = currentIndex - 1;
              setCurrentIndex(prevIndex);
              setNotes(responses[controls[prevIndex]?.id]?.notes || "");
            }
          }}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <a
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all"
        >
          Save & View Dashboard
        </a>
        <button
          onClick={() => {
            if (currentIndex < controls.length - 1) {
              const nextIndex = currentIndex + 1;
              setCurrentIndex(nextIndex);
              setNotes(responses[controls[nextIndex]?.id]?.notes || "");
            }
          }}
          disabled={currentIndex === controls.length - 1}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05] hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
