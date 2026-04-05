import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { SSPReport } from "@/lib/reports/ssp-report";
import { POAMReport } from "@/lib/reports/poam-report";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success, remaining } = rateLimit(`reports:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let reportType: string;
  try {
    const body = await request.json();
    reportType = body.reportType;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!reportType || !["ssp", "poam", "gap", "executive"].includes(reportType)) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  // Get org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, organizations(name)")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const orgName = (membership.organizations as any)?.name || "Organization";

  // Get assessment
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("org_id", membership.org_id)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!assessment) {
    return NextResponse.json({ error: "No assessment found" }, { status: 404 });
  }

  // Get responses with control details
  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("*, cmmc_controls(*, cmmc_domains(name))")
    .eq("assessment_id", assessment.id);

  const { count: totalControls } = await supabase
    .from("cmmc_controls")
    .select("*", { count: "exact", head: true })
    .lte("level", assessment.target_level);

  const controls = (responses || []).map((r: any) => ({
    id: r.cmmc_controls?.id || r.control_id,
    title: r.cmmc_controls?.title || "",
    description: r.cmmc_controls?.description || "",
    domain_name: r.cmmc_controls?.cmmc_domains?.name || "",
    status: r.status,
    notes: r.notes || "",
    remediation: r.cmmc_controls?.remediation_guidance || "",
  }));

  const met = controls.filter((c) => c.status === "met").length;
  const notMet = controls.filter((c) => c.status === "not_met").length;
  const partial = controls.filter((c) => c.status === "partially_met").length;
  const total = totalControls || 110;
  const score = total > 0 ? Math.round((met / total) * 100) : 0;
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let pdfBuffer: Buffer;
  let fileName: string;

  if (reportType === "ssp" || reportType === "gap" || reportType === "executive") {
    pdfBuffer = await renderToBuffer(
      React.createElement(SSPReport, {
        data: { orgName, date, targetLevel: assessment.target_level, score, totalControls: total, met, notMet, partial, controls },
      }) as any
    );
    fileName = `${orgName.replace(/\s+/g, "-")}-SSP-${reportType}-${Date.now()}.pdf`;
  } else {
    const gaps = controls.filter((c) => c.status === "not_met" || c.status === "partially_met");
    pdfBuffer = await renderToBuffer(
      React.createElement(POAMReport, {
        data: { orgName, date, targetLevel: assessment.target_level, gaps },
      }) as any
    );
    fileName = `${orgName.replace(/\s+/g, "-")}-POAM-${Date.now()}.pdf`;
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
