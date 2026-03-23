import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreCard";
import { ScoreChart } from "@/components/ScoreChart";
import { DomainProgress } from "@/components/DomainProgress";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <DashboardLayout userEmail={user.email || ""} orgName={orgName}>
      <div className="p-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Compliance Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant={score >= 80 ? "success" : score >= 50 ? "warning" : "danger"}>
                {score >= 80 ? "On Track" : score >= 50 ? "In Progress" : "Needs Attention"}
              </Badge>
              <span className="text-neutral-500 text-sm">
                CMMC Level {assessment?.target_level}
              </span>
            </div>
          </div>
          <Button asChild>
            <Link href="/assessment">
              Continue Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Top Row: Chart + Score Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Score Chart */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle className="text-sm text-neutral-400 font-normal">Overall Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreChart
                score={score}
                met={met.length}
                notMet={notMet.length}
                partial={partial.length}
                notAssessed={notAssessed}
              />
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-neutral-400">Met ({met.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs text-neutral-400">Not Met ({notMet.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-neutral-400">Partial ({partial.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                  <span className="text-xs text-neutral-400">Pending ({notAssessed})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Cards */}
          <ScoreCard title="Controls Met" value={`${met.length}/${totalCount}`} color="success" icon={CheckCircle2} />
          <ScoreCard title="Gaps Found" value={`${notMet.length}`} color="danger" icon={XCircle} />
          <ScoreCard title="Partially Met" value={`${partial.length}`} color="warning" icon={AlertTriangle} />
          <ScoreCard title="Overall Score" value={`${score}%`} color={score >= 80 ? "success" : score >= 50 ? "warning" : "danger"} icon={BarChart3} />
        </div>

        {/* Domain Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Domain Breakdown</CardTitle>
              <span className="text-xs text-neutral-500">14 domains · {totalCount} controls</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/assessment" className="group">
            <Card className="h-full hover:border-blue-500/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition">Continue Assessment</h3>
                <p className="text-neutral-500 text-sm">Answer questions about your security controls</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/evidence" className="group">
            <Card className="h-full hover:border-blue-500/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-emerald-400 transition">Upload Evidence</h3>
                <p className="text-neutral-500 text-sm">Attach documentation to your controls</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/reports" className="group">
            <Card className="h-full hover:border-blue-500/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-amber-400 transition">Generate Reports</h3>
                <p className="text-neutral-500 text-sm">Export SSP, POA&M, and audit reports</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
