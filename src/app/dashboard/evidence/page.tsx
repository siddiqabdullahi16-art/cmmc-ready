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
  const [loadError, setLoadError] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership, error: memberErr } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (memberErr || !membership) { setLoading(false); return; }

      const { data: assessment } = await supabase
        .from("assessments")
        .select("id")
        .eq("org_id", membership.org_id)
        .eq("status", "in_progress")
        .limit(1)
        .single();

      if (!assessment) { setLoading(false); return; }

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

      const { data: evidenceData, error: evErr } = await supabase
        .from("evidence")
        .select("*, assessment_responses(control_id, cmmc_controls(title, domain_id))")
        .order("created_at", { ascending: false });

      if (evErr) throw evErr;
      if (evidenceData) setEvidence(evidenceData as any);
    } catch {
      setLoadError("Failed to load evidence. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !selectedControl) return;
    setUploading(true);
    setUploadError("");

    const file = e.target.files[0];
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: storageError } = await supabase.storage
      .from("evidence")
      .upload(filePath, file);

    if (storageError) {
      setUploadError("Upload failed: " + storageError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("evidence").insert({
      response_id: selectedControl,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
    });

    if (insertError) {
      setUploadError("File uploaded but failed to save record. Please refresh.");
    }

    setUploading(false);
    loadData();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div className="min-h-screen dashboard-bg">
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(10,14,26,0.7)] border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-base font-bold text-white">
              CMMC<span className="gradient-text-blue">-Ready</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero header */}
        <div className="mesh-hero p-7 mb-6">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 w-fit mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Evidence Vault
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              Evidence <span className="gradient-text-blue">Tracking</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {evidence.length > 0
                ? `${evidence.length} document${evidence.length !== 1 ? "s" : ""} uploaded · linked to your controls`
                : "Upload documentation to support your control responses"}
            </p>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-4 mb-6 backdrop-blur-sm">
            {loadError}
          </div>
        )}

        {/* Upload Section */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
            Upload Evidence
          </h2>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Link to Control</label>
              <select
                value={selectedControl}
                onChange={(e) => setSelectedControl(e.target.value)}
                className="w-full bg-[#0f1524] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                selectedControl
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                  : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
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
          {uploadError && (
            <p className="text-red-400 text-xs mt-3">{uploadError}</p>
          )}
        </div>

        {/* Evidence List */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
              Uploaded Evidence
            </span>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {evidence.length} file{evidence.length !== 1 ? "s" : ""}
            </span>
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : evidence.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No evidence uploaded yet.</p>
              <p className="text-slate-500 text-xs mt-1">Select a control above and upload a file to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{e.file_name}</p>
                    <p className="text-xs text-slate-500 truncate">
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
