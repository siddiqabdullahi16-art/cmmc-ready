import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentFlow } from "@/components/AssessmentFlow";
import { requireActiveSubscription } from "@/lib/subscription";

export default async function AssessmentPage() {
  await requireActiveSubscription();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");

  // Get active assessment
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
      .insert({
        org_id: membership.org_id,
        name: "CMMC Level 2 Assessment",
        target_level: 2,
      })
      .select()
      .single();
    assessment = newAssessment;
  }

  // Get all controls for target level
  const { data: controls } = await supabase
    .from("cmmc_controls")
    .select("*, cmmc_domains(name, abbreviation)")
    .lte("level", assessment?.target_level || 2)
    .order("sort_order");

  // Get existing responses
  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("*")
    .eq("assessment_id", assessment?.id);

  const responseMap: Record<string, { status: string; notes: string }> = {};
  responses?.forEach((r) => {
    responseMap[r.control_id] = { status: r.status, notes: r.notes || "" };
  });

  return (
    <div className="min-h-screen dashboard-bg">
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(10,14,26,0.7)] border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-base font-bold text-white">
              CMMC<span className="gradient-text-blue">-Ready</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
              Level {assessment?.target_level}
            </span>
            <a href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Dashboard
            </a>
          </div>
        </div>
      </nav>

      <AssessmentFlow
        assessmentId={assessment?.id}
        controls={controls || []}
        existingResponses={responseMap}
      />
    </div>
  );
}
