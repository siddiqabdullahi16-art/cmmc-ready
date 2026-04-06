import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

type PlanKey = keyof typeof PLANS;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmmcready.pro";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success, remaining } = rateLimit(`checkout:${ip}`, 5, 60_000);
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

  const body = await request.json();
  const planKey = body.planKey as PlanKey | undefined;

  // Only accept known plan keys — no raw priceId passthrough
  if (!planKey || !PLANS[planKey]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const resolvedPriceId = PLANS[planKey].priceId;
  if (!resolvedPriceId) {
    return NextResponse.json({ error: "Plan not configured. Please contact support." }, { status: 500 });
  }

  // Look up existing Stripe customer to avoid duplicates
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, organizations(stripe_customer_id)")
    .eq("user_id", user.id)
    .single();

  const existingCustomerId = (membership?.organizations as any)?.stripe_customer_id as string | null;

  // Build checkout params — use existing customer if available
  const checkoutParams: Parameters<typeof getStripe>extends never ? never : Record<string, unknown> = {
    line_items: [{ price: resolvedPriceId, quantity: 1 }],
    mode: "subscription" as const,
    success_url: `${SITE_URL}/dashboard?checkout=success`,
    cancel_url: `${SITE_URL}/pricing`,
    metadata: { user_id: user.id },
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 14 },
    payment_method_collection: "always",
  };

  const session = await getStripe().checkout.sessions.create(
    existingCustomerId
      ? { ...checkoutParams, customer: existingCustomerId }
      : { ...checkoutParams, customer_email: user.email }
  );

  return NextResponse.json({ url: session.url });
}
