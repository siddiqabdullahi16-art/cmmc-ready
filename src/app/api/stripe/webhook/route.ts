import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;

      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const { data: membership } = await supabaseAdmin
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .single();

        if (membership) {
          const { error } = await supabaseAdmin
            .from("organizations")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", membership.org_id);

          if (error) {
            console.error("Failed to update org after checkout:", error);
            return NextResponse.json({ error: "DB update failed" }, { status: 500 });
          }
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const { error } = await supabaseAdmin
        .from("organizations")
        .update({
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error(`Failed to update org on ${event.type}:`, error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        const { error } = await supabaseAdmin
          .from("organizations")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", String(invoice.subscription));

        if (error) {
          console.error("Failed to update org on payment failure:", error);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
