import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: "Starter",
    price: 9900,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
  },
  professional: {
    name: "Professional",
    price: 29900,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
  },
  enterprise: {
    name: "Enterprise",
    price: 49900,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
  },
} as const;

export function validateStripePriceIds() {
  const missing = (["STRIPE_STARTER_PRICE_ID", "STRIPE_PRO_PRICE_ID", "STRIPE_ENTERPRISE_PRICE_ID"] as const)
    .filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Stripe price ID env vars: ${missing.join(", ")}`);
  }
}
