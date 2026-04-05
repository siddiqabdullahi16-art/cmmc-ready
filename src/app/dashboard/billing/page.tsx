import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { CreditCard, Calendar, CheckCircle2 } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  trialing: { label: "Trialing", color: "text-blue-300 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
  past_due: { label: "Past Due", color: "text-amber-300 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  canceled: { label: "Canceled", color: "text-red-300 bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  incomplete: { label: "Incomplete", color: "text-slate-300 bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" },
  unpaid: { label: "Unpaid", color: "text-red-300 bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, organizations(name, subscription_status, stripe_customer_id, stripe_subscription_id, created_at)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");

  const org = (membership.organizations as any) as {
    name: string;
    subscription_status: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
  } | null;

  const orgName = org?.name || "My Organization";
  const status = org?.subscription_status || "none";
  const statusConfig = STATUS_LABELS[status] || { label: "No Subscription", color: "text-slate-300 bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" };
  const hasCustomer = !!org?.stripe_customer_id;

  return (
    <DashboardLayout userEmail={user.email || ""} orgName={orgName}>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Hero header */}
        <div className="mesh-hero p-7 mb-6">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 w-fit mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Billing
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              Subscription <span className="gradient-text-emerald">& Billing</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your plan, payment method, and invoices.
            </p>
          </div>
        </div>

        {/* Current plan card */}
        <div className="glass-card p-6 mb-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
              Current Plan
            </h2>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Organization</p>
              </div>
              <p className="text-sm font-semibold text-white truncate">{orgName}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Customer ID</p>
              </div>
              <p className="text-sm font-mono text-slate-300 truncate">{org?.stripe_customer_id || "Not set up"}</p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Org Since</p>
              </div>
              <p className="text-sm font-semibold text-white">
                {org?.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {hasCustomer ? (
            <BillingPortalButton />
          ) : (
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all"
            >
              Choose a Plan →
            </a>
          )}
        </div>

        {/* Info card */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
            What you can do in the customer portal
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              Update your payment method or billing details
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              Change or cancel your subscription
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              Download invoices and view payment history
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              Apply or remove promo codes
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
