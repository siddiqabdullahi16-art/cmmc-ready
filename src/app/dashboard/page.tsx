import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreCard";
import { ScoreChart } from "@/components/ScoreChart";
import { DomainProgress } from "@/components/DomainProgress";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClipboardCheck, FileText, Upload, ArrowRight, CheckCircle2, AlertTriangle, XCircle, BarChart3 } from "lucide-react";

export default async function DashboardPage() {
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
  const statusColor = score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : score >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : answered > 0 ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-slate-400 bg-slate-500/10 border-slate-500/20";

  return (
    <DashboardLayout userEmail={user.email || ""} orgName={orgName}>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Compliance Dashboard</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusLabel}
              </span>
              <span className="text-slate-500 text-sm">CMMC Level {assessment?.target_level} · {answered}/{totalCount} controls answered</span>
            </div>
          </div>
          <Link
            href="/assessment"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
          >
            Continue Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Assessment progress strip */}
        {answered > 0 && (
          <div className="mb-8 rounded-xl p-4 flex items-center gap-4" style={{ background: "#111827", border: "1px solid rgba(99,120,255,0.12)" }}>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">Assessment Progress</span>
                <span>{answered} of {totalCount} answered ({progressPct}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-blue-400 font-bold text-lg">{progressPct}%</p>
              <p className="text-slate-500 text-xs">Complete</p>
            </div>
          </div>
        )}

        {/* Top Row: Chart + Score Cards */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          {/* Score Donut Card */}
          <div className="lg:row-span-2 rounded-xl p-6" style={{ background: "#111827", border: "1px solid rgba(99,120,255,0.12)" }}>
            <p className="text-slate-400 text-sm font-medium mb-5">Overall Readiness</p>
            <ScoreChart
              score={score}
              met={met.length}
              notMet={notMet.length}
              partial={partial.length}
              notAssessed={notAssessed}
            />
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-6 pt-5" style={{ borderTop: "1px solid rgba(99,120,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs text-slate-400">Met <span className="text-white font-medium">({met.length})</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-xs text-slate-400">Not Met <span className="text-white font-medium">({notMet.length})</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs text-slate-400">Partial <span className="text-white font-medium">({partial.length})</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
                <span className="text-xs text-slate-400">Pending <span className="text-white font-medium">({notAssessed})</span></span>
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <ScoreCard title="Controls Met" value={`${met.length}/${totalCount}`} color="success" icon={CheckCircle2} />
          <ScoreCard title="Gaps Found" value={`${notMet.length}`} color="danger" icon={XCircle} />
          <ScoreCard title="Partially Met" value={`${partial.length}`} color="warning" icon={AlertTriangle} />
          <ScoreCard title="Readiness Score" value={`${score}%`} color={score >= 80 ? "success" : score >= 50 ? "warning" : "danger"} icon={BarChart3} />
        </div>

        {/* Domain Breakdown */}
        <div className="rounded-xl mb-6" style={{ background: "#111827", border: "1px solid rgba(99,120,255,0.12)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(99,120,255,0.08)" }}>
            <h2 className="font-semibold text-white">Domain Breakdown</h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">14 domains · {totalCount} controls</span>
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/assessment" className="group">
            <div className="h-full rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] border border-[rgba(99,120,255,0.12)] group-hover:border-[rgba(59,130,246,0.35)] bg-[#111827]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition-colors">
                <ClipboardCheck className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Continue Assessment</h3>
              <p className="text-slate-500 text-sm">Answer questions about your security controls</p>
            </div>
          </Link>

          <Link href="/dashboard/evidence" className="group">
            <div className="h-full rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] border border-[rgba(99,120,255,0.12)] group-hover:border-[rgba(16,185,129,0.35)] bg-[#111827]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4 group-hover:bg-emerald-500/25 transition-colors">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">Upload Evidence</h3>
              <p className="text-slate-500 text-sm">Attach documentation to your controls</p>
            </div>
          </Link>

          <Link href="/dashboard/reports" className="group">
            <div className="h-full rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] border border-[rgba(99,120,255,0.12)] group-hover:border-[rgba(245,158,11,0.35)] bg-[#111827]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4 group-hover:bg-amber-500/25 transition-colors">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">Generate Reports</h3>
              <p className="text-slate-500 text-sm">Export SSP, POA&M, and audit reports</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
