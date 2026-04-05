import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Subscription states that grant access
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

// Grace states — user can still access for a short time (past_due = failed payment, give them time to update card)
const GRACE_STATUSES = new Set(["past_due"]);

export type SubscriptionSnapshot = {
  orgId: string;
  status: string | null;
  stripeCustomerId: string | null;
  hasAccess: boolean;
  inGrace: boolean;
};

/**
 * Reads the current user's org + subscription status.
 * Returns null if no user or no org membership.
 */
export async function getSubscription(): Promise<SubscriptionSnapshot | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, organizations(subscription_status, stripe_customer_id)")
    .eq("user_id", user.id)
    .single();

  if (!membership) return null;

  const org = (membership.organizations as any) as { subscription_status: string | null; stripe_customer_id: string | null } | null;
  const status = org?.subscription_status ?? null;

  return {
    orgId: membership.org_id,
    status,
    stripeCustomerId: org?.stripe_customer_id ?? null,
    hasAccess: status !== null && ACTIVE_STATUSES.has(status),
    inGrace: status !== null && GRACE_STATUSES.has(status),
  };
}

/**
 * Enforces an active or trialing subscription. Redirects to /pricing if not.
 * Call from server components or server actions in protected routes.
 */
export async function requireActiveSubscription(): Promise<SubscriptionSnapshot> {
  const sub = await getSubscription();

  // No user → let existing auth guards handle redirect
  if (!sub) redirect("/auth/login");

  // Allow grace period (past_due) but flag in UI
  if (sub.hasAccess || sub.inGrace) return sub;

  // No subscription at all → send to pricing
  redirect("/pricing?reason=subscribe");
}
