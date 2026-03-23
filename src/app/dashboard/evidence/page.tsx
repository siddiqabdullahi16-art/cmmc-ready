"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type EvidenceItem = {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  response_id: string;
  assessment_responses: {
    control_id: string;
    cmmc_controls: { title: string; domain_id: string };
  };
};

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [controls, setControls] = useState<{ id: string; title: string; domain_id: string }[]>([]);
  const [selectedControl, setSelectedControl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get controls that have responses
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return;

    const { data: assessment } = await supabase
      .from("assessments")
      .select("id")
      .eq("org_id", membership.org_id)
      .eq("status", "in_progress")
      .limit(1)
      .single();

    if (!assessment) return;

    const { data: responses } = await supabase
      .from("assessment_responses")
      .select("id, control_id, cmmc_controls(title, domain_id)")
      .eq("assessment_id", assessment.id);

    if (responses) {
      setControls(
        responses.map((r) => ({
          id: r.id,
          title: (r.cmmc_controls as any)?.title || r.control_id,
          domain_id: (r.cmmc_controls as any)?.domain_id || "",
        }))
      );
    }

    const { data: evidenceData } = await supabase
      .from("evidence")
      .select("*, assessment_responses(control_id, cmmc_controls(title, domain_id))")
      .order("created_at", { ascending: false });

    if (evidenceData) setEvidence(evidenceData as any);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !selectedControl) return;
    setUploading(true);

    const file = e.target.files[0];
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    await supabase.from("evidence").insert({
      response_id: selectedControl,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
    });

    setUploading(false);
    loadData();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            <span className="text-[var(--primary)]">CMMC</span>-Ready
          </Link>
          <Link href="/dashboard" className="text-[var(--muted)] text-sm hover:text-white">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Evidence Tracking</h1>

        {/* Upload Section */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Upload Evidence</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-[var(--muted)] mb-1">Link to Control</label>
              <select
                value={selectedControl}
                onChange={(e) => setSelectedControl(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">Select a control...</option>
                {controls.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.domain_id}] {c.title}
                  </option>
                ))}
              </select>
            </div>
            <label
              className={`px-6 py-2 rounded-lg text-sm cursor-pointer transition ${
                selectedControl
                  ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                  : "bg-[var(--card-border)] text-[var(--muted)] cursor-not-allowed"
              }`}
            >
              {uploading ? "Uploading..." : "Choose File"}
              <input
                type="file"
                onChange={handleUpload}
                disabled={!selectedControl || uploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.csv,.txt"
              />
            </label>
          </div>
        </div>

        {/* Evidence List */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="font-semibold mb-4">Uploaded Evidence ({evidence.length})</h2>
          {loading ? (
            <p className="text-[var(--muted)] text-sm">Loading...</p>
          ) : evidence.length === 0 ? (
            <p className="text-[var(--muted)] text-sm">No evidence uploaded yet. Start by selecting a control and uploading a file.</p>
          ) : (
            <div className="space-y-3">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{e.file_name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {(e.assessment_responses as any)?.cmmc_controls?.title || "Unknown control"} · {formatSize(e.file_size || 0)} · {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
