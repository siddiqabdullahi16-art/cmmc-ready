"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardList, BarChart3, TrendingUp, Download, Shield } from "lucide-react";

const REPORT_TYPES = [
  {
    id: "ssp",
    title: "System Security Plan (SSP)",
    description: "Complete documentation of your security controls, system boundaries, and implementation status. Required for C3PAO assessment.",
    icon: FileText,
    badge: "Required",
    badgeVariant: "danger" as const,
  },
  {
    id: "poam",
    title: "Plan of Action & Milestones (POA&M)",
    description: "Detailed remediation plan with all identified gaps, action items, target dates, and owners.",
    icon: ClipboardList,
    badge: "Required",
    badgeVariant: "danger" as const,
  },
  {
    id: "gap",
    title: "Gap Analysis Report",
    description: "Comprehensive breakdown of your compliance gaps organized by domain with specific remediation guidance.",
    icon: BarChart3,
    badge: "Recommended",
    badgeVariant: "warning" as const,
  },
  {
    id: "executive",
    title: "Executive Summary",
    description: "High-level overview of your CMMC readiness for leadership, board presentations, and stakeholders.",
    icon: TrendingUp,
    badge: "Optional",
    badgeVariant: "muted" as const,
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  async function generateReport(reportType: string) {
    setGenerating(reportType);
    setReportError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setReportError(data.error || "Failed to generate report. Please complete some assessment questions first.");
        setGenerating(null);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `cmmc-${reportType}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setReportError("Error generating report. Please try again.");
    }

    setGenerating(null);
  }

  return (
    <div className="min-h-screen dashboard-bg">
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(10,14,26,0.7)] border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Shield className="w-4 h-4 text-white" />
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
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              PDF Export
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              Compliance <span className="gradient-text-amber">Reports</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Generate professional, audit-ready documents for your C3PAO assessment.
            </p>
          </div>
        </div>

        {reportError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-4 mb-6 backdrop-blur-sm">
            {reportError}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {REPORT_TYPES.map((report) => (
            <div key={report.id} className="group glass-card p-6 hover:!border-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center group-hover:border-blue-400/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all">
                  <report.icon className="w-5 h-5 text-blue-400" />
                </div>
                <Badge variant={report.badgeVariant}>{report.badge}</Badge>
              </div>
              <h3 className="font-semibold text-white mb-2">{report.title}</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                {report.description}
              </p>
              <Button
                onClick={() => generateReport(report.id)}
                disabled={generating !== null}
                className="w-full"
                variant={generating === report.id ? "secondary" : "default"}
              >
                {generating === report.id ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
