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

  async function generateReport(reportType: string) {
    setGenerating(reportType);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType }),
      });

      if (!response.ok) {
        alert("Failed to generate report. Please complete some assessment questions first.");
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
      alert("Error generating report. Please try again.");
    }

    setGenerating(null);
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold">
              <span className="text-blue-500">CMMC</span>-Ready
            </span>
          </Link>
          <Link href="/dashboard" className="text-neutral-400 text-sm hover:text-white transition">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Reports</h1>
          <p className="text-neutral-400">
            Generate professional, audit-ready compliance reports as PDF documents.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {REPORT_TYPES.map((report) => (
            <Card key={report.id} className="group hover:border-blue-500/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <report.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <Badge variant={report.badgeVariant}>{report.badge}</Badge>
                </div>
                <h3 className="font-semibold mb-2">{report.title}</h3>
                <p className="text-neutral-400 text-sm mb-5 leading-relaxed">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
