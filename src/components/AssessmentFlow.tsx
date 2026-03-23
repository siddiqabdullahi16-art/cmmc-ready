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

      if (!error) {
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--muted)] mb-2">
          <span>
            Question {currentIndex + 1} of {controls.length}
          </span>
          <span>{progress} answered</span>
        </div>
        <div className="w-full bg-[var(--card)] rounded-full h-2">
          <div
            className="bg-[var(--primary)] h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / controls.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Domain Badge */}
      <div className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] text-xs px-3 py-1 rounded-full mb-4">
        {currentDomain?.abbreviation} — {currentDomain?.name}
      </div>

      {/* Control Card */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-8 mb-6">
        <h2 className="text-xl font-semibold mb-2">{control.title}</h2>
        <p className="text-[var(--muted)] text-sm mb-4">{control.id}</p>
        <p className="text-[var(--foreground)] mb-6">{control.assessment_question}</p>
        <p className="text-[var(--muted)] text-sm">{control.description}</p>
      </div>

      {/* Response Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = responses[control.id]?.status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => saveResponse(opt.value)}
              disabled={saving}
              className={`p-4 rounded-xl border text-left transition ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--primary)]/50"
              } disabled:opacity-50`}
            >
              <div className={`w-3 h-3 rounded-full ${opt.color} mb-2`} />
              <p className="font-medium text-sm">{opt.label}</p>
              <p className="text-xs text-[var(--muted)]">{opt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this control (optional)..."
          className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 text-sm focus:outline-none focus:border-[var(--primary)] min-h-[80px] resize-y"
        />
      </div>

      {/* Remediation Guidance (shown for not_met) */}
      {responses[control.id]?.status === "not_met" && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Remediation Guidance</h3>
          <p className="text-sm text-[var(--muted)]">{control.remediation_guidance}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              const prevIndex = currentIndex - 1;
              setCurrentIndex(prevIndex);
              setNotes(responses[controls[prevIndex]?.id]?.notes || "");
            }
          }}
          disabled={currentIndex === 0}
          className="px-6 py-2 border border-[var(--card-border)] rounded-lg text-sm hover:bg-[var(--card)] transition disabled:opacity-30"
        >
          Previous
        </button>
        <a
          href="/dashboard"
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg text-sm hover:bg-[var(--primary-hover)] transition"
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
          className="px-6 py-2 border border-[var(--card-border)] rounded-lg text-sm hover:bg-[var(--card)] transition disabled:opacity-30"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
