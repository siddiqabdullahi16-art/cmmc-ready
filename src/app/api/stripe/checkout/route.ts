import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

type PlanKey = keyof typeof PLANS;

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
  const priceId = body.priceId as string | undefined;

  const resolvedPriceId = priceId || (planKey && PLANS[planKey]?.priceId);

  if (!resolvedPriceId) {
    return NextResponse.json({ error: "Invalid plan or price ID" }, { status: 400 });
  }

  const origin = request.headers.get("origin") || "https://cmmcready.pro";

  const session = await getStripe().checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: resolvedPriceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      user_id: user.id,
    },
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });

  return NextResponse.json({ url: session.url });
}
