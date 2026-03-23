import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentFlow } from "@/components/AssessmentFlow";

export default async function AssessmentPage() {
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
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold">
            <span className="text-[var(--primary)]">CMMC</span>-Ready
          </a>
          <span className="text-[var(--muted)] text-sm">
            Level {assessment?.target_level} Assessment
          </span>
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
