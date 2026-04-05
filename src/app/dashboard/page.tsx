import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreCard";
import { ScoreChart } from "@/components/ScoreChart";
import { DomainProgress } from "@/components/DomainProgress";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClipboardCheck, FileText, Upload, ArrowRight, CheckCircle2, AlertTriangle, XCircle, BarChart3, Sparkles } from "lucide-react";
import { requireActiveSubscription } from "@/lib/subscription";

export default async function DashboardPage() {
  await requireActiveSubscription();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, organizations(name)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");

  const orgName = (membership.organizations as any)?.name || "My Organization";

  let { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("org_id", membership.org_id)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!assessment) {
    const { data: newAssessment } = await supabase
      .from("assessments")
      .insert({ org_id: membership.org_id, name: "CMMC Level 2 Assessment" })
      .select()
      .single();
    assessment = newAssessment;
  }

  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("status, control_id, cmmc_controls(domain_id, cmmc_domains(name, abbreviation))")
    .eq("assessment_id", assessment?.id);

  const { count: totalControls } = await supabase
    .from("cmmc_controls")
    .select("*", { count: "exact", head: true })
    .lte("level", assessment?.target_level || 2);

  const met = responses?.filter((r) => r.status === "met") || [];
  const notMet = responses?.filter((r) => r.status === "not_met") || [];
  const partial = responses?.filter((r) => r.status === "partially_met") || [];

  const totalCount = totalControls || 110;
  const notAssessed = totalCount - met.length - notMet.length - partial.length;
  const score = totalCount > 0 ? Math.round((met.length / totalCount) * 100) : 0;
  const answered = met.length + notMet.length + partial.length;
  const progressPct = Math.round((answered / totalCount) * 100);

  const domainScores = new Map<string, { name: string; met: number; total: number; notMet: number; partial: number }>();

  const { data: domains } = await supabase
    .from("cmmc_domains")
    .select("id, name, abbreviation")
    .order("sort_order");

  const { data: controlsByDomain } = await supabase
    .from("cmmc_controls")
    .select("domain_id")
    .lte("level", assessment?.target_level || 2);

  domains?.forEach((d) => {
    const domainControlCount = controlsByDomain?.filter((c) => c.domain_id === d.id).length || 0;
    domainScores.set(d.id, { name: d.name, met: 0, total: domainControlCount, notMet: 0, partial: 0 });
  });

  responses?.forEach((r) => {
    const domainId = (r.cmmc_controls as any)?.domain_id;
    if (domainId && domainScores.has(domainId)) {
      const ds = domainScores.get(domainId)!;
      if (r.status === "met") ds.met++;
      if (r.status === "not_met") ds.notMet++;
      if (r.status === "partially_met") ds.partial++;
    }
  });

  const statusLabel = score >= 80 ? "On Track" : score >= 50 ? "In Progress" : answered > 0 ? "Needs Attention" : "Not Started";
  const statusDotColor = score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : answered > 0 ? "text-red-400" : "text-slate-400";

  return (
    <DashboardLayout userEmail={user.email || ""} orgName={orgName}>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Hero Header — mesh gradient with status */}
        <div className="mesh-hero p-8 mb-6">
          <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300">
                  <span className={`relative w-1.5 h-1.5 rounded-full bg-current pulse-dot ${statusDotColor}`} />
                  <span className="ml-1">{statusLabel}</span>
                </div>
                <span className="text-xs text-slate-400">CMMC Level {assessment?.target_level}</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Welcome back,{" "}
                <span className="gradient-text-blue">{orgName}</span>
              </h1>
              <p className="text-slate-400 text-sm">
                {answered > 0
                  ? `You've answered ${answered} of ${totalCount} controls · ${progressPct}% complete`
                  : `Let's start your CMMC Level ${assessment?.target_level} assessment — ${totalCount} controls to review`}
              </p>
            </div>
            <Link
              href="/assessment"
              className="shine-hover flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              {answered > 0 ? "Continue Assessment" : "Start Assessment"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress rail inside hero */}
          {answered > 0 && (
            <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="font-medium">Assessment Progress</span>
                <span className="font-mono text-slate-400">{answered}/{totalCount}</span>
              </div>
              <div className="relative w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transition-all duration-700 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bento Grid — Score donut (left, tall) + stat tiles (right, 2x2) */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          {/* Score Donut — conic animated border hero card */}
          <div className="lg:row-span-2 conic-border">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p className="text-slate-400 text-sm font-medium">Overall Readiness</p>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-0.5 rounded bg-white/5">Live</span>
              </div>
              <ScoreChart
                score={score}
                met={met.length}
                notMet={notMet.length}
                partial={partial.length}
                notAssessed={notAssessed}
              />
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-6 pt-5 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] shrink-0" />
                  <span className="text-xs text-slate-400">Met <span className="text-white font-medium tabular-nums">({met.length})</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] shrink-0" />
                  <span className="text-xs text-slate-400">Gaps <span className="text-white font-medium tabular-nums">({notMet.length})</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0" />
                  <span className="text-xs text-slate-400">Partial <span className="text-white font-medium tabular-nums">({partial.length})</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-xs text-slate-400">Pending <span className="text-white font-medium tabular-nums">({notAssessed})</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Score stat tiles */}
          <ScoreCard title="Controls Met" value={`${met.length}/${totalCount}`} color="success" icon={CheckCircle2} />
          <ScoreCard title="Gaps Found" value={`${notMet.length}`} color="danger" icon={XCircle} />
          <ScoreCard title="Partially Met" value={`${partial.length}`} color="warning" icon={AlertTriangle} />
          <ScoreCard title="Readiness Score" value={`${score}%`} color={score >= 80 ? "success" : score >= 50 ? "warning" : "danger"} icon={BarChart3} />
        </div>

        {/* Domain Breakdown — glass card */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div>
              <h2 className="font-semibold text-white">Domain Breakdown</h2>
              <p className="text-xs text-slate-500 mt-0.5">14 domains · {totalCount} total controls</p>
            </div>
            <span className="text-xs font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
              {progressPct}% complete
            </span>
          </div>
          <div className="p-3">
            {Array.from(domainScores.entries()).map(([id, ds]) => (
              <DomainProgress
                key={id}
                domainId={id}
                name={ds.name}
                met={ds.met}
                total={ds.total}
                notMet={ds.notMet}
                partial={ds.partial}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions — 2026 bento with hover shine */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/assessment" className="group shine-hover glass-card p-5 hover:!border-blue-500/40 hover:scale-[1.02] transition-all">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:border-blue-400/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">Continue Assessment</h3>
            <p className="text-slate-400 text-sm">Answer questions about your security controls</p>
          </Link>

          <Link href="/dashboard/evidence" className="group shine-hover glass-card p-5 hover:!border-emerald-500/40 hover:scale-[1.02] transition-all">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:border-emerald-400/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">Upload Evidence</h3>
            <p className="text-slate-400 text-sm">Attach documentation to your controls</p>
          </Link>

          <Link href="/dashboard/reports" className="group shine-hover glass-card p-5 hover:!border-amber-500/40 hover:scale-[1.02] transition-all">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-4 border border-amber-500/20 group-hover:border-amber-400/40 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-amber-300 transition-colors">Generate Reports</h3>
            <p className="text-slate-400 text-sm">Export SSP, POA&M, and audit reports</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
