"use server";

import { getSession } from "@/lib/auth";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { BUSINESS_PLAN_KEY, type BillingPeriod } from "@/lib/config/pricing";
import { getStripe } from "@/lib/stripe";
import { businessPriceId, getBusinessSubscription } from "@/lib/subscription";

const INTEGRATION_IDENTIFIER = "lumen-business-sub-vkzdrpma";

export type SubscriptionActionResult =
    { ok: true; url: string } | { ok: false; message: string };

export async function startBusinessCheckout(
    period: BillingPeriod,
): Promise<SubscriptionActionResult> {
    const session = await getSession();
    if (!session) {
        return { ok: false, message: "Sign in to start a plan." };
    }

    const stripe = getStripe();
    if (!stripe) {
        return { ok: false, message: "Subscriptions aren't configured yet." };
    }

    const billing: BillingPeriod = period === "yearly" ? "yearly" : "monthly";
    const price = businessPriceId(billing);
    if (!price) {
        return { ok: false, message: "Subscriptions aren't configured yet." };
    }

    const existing = await getBusinessSubscription();
    if (existing) {
        return {
            ok: false,
            message:
                "You're already on Lumen Business. Manage it from Billing.",
        };
    }

    const customer = await getOrCreateStripeCustomer();
    if (!customer) {
        return { ok: false, message: "Could not start checkout. Try again." };
    }

    const origin = process.env.BETTER_AUTH_URL;
    if (!origin) {
        return { ok: false, message: "Could not start checkout. Try again." };
    }

    try {
        const checkout = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer,
            line_items: [{ price, quantity: 1 }],
            subscription_data: {
                metadata: { userId: session.user.id, plan: BUSINESS_PLAN_KEY },
            },
            metadata: { userId: session.user.id, plan: BUSINESS_PLAN_KEY },
            integration_identifier: INTEGRATION_IDENTIFIER,
            success_url: `${origin}/dashboard/settings/billing?subscribed=1`,
            cancel_url: `${origin}/pricing`,
            allow_promotion_codes: true,
        });

        if (!checkout.url) {
            return {
                ok: false,
                message: "Could not start checkout. Try again.",
            };
        }
        return { ok: true, url: checkout.url };
    } catch {
        return { ok: false, message: "Could not start checkout. Try again." };
    }
}
