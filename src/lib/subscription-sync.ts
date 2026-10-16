import "server-only";

import type Stripe from "stripe";

import { BUSINESS_PLAN_KEY } from "@/lib/config/pricing";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type {
    SubscriptionInterval,
    SubscriptionStatus,
} from "@/generated/prisma/client";

const STATUS: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: "ACTIVE",
    trialing: "TRIALING",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    unpaid: "UNPAID",
    paused: "PAUSED",
};

async function resolveUserId(
    subscription: Stripe.Subscription,
): Promise<string | null> {
    const fromMetadata = subscription.metadata?.userId;
    if (fromMetadata) {
        const exists = await db.user.findUnique({
            where: { id: fromMetadata },
            select: { id: true },
        });
        if (exists) return exists.id;
    }

    const customerId =
        typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
    if (!customerId) return null;

    const byCustomer = await db.user.findUnique({
        where: { stripeCustomerId: customerId },
        select: { id: true },
    });
    return byCustomer?.id ?? null;
}

function readItem(subscription: Stripe.Subscription) {
    const item = subscription.items?.data?.[0];
    const price = item?.price;
    const recurring = price?.recurring;

    const periodEnd =
        item?.current_period_end ??
        (subscription as unknown as { current_period_end?: number })
            .current_period_end ??
        null;

    return {
        priceId: price?.id ?? "",
        interval: (recurring?.interval === "year"
            ? "YEAR"
            : "MONTH") as SubscriptionInterval,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    };
}

async function syncSubscription(subscription: Stripe.Subscription) {
    const userId = await resolveUserId(subscription);
    if (!userId) {
        return;
    }

    const { priceId, interval, currentPeriodEnd } = readItem(subscription);
    const status = STATUS[subscription.status] ?? "INCOMPLETE";

    const data = {
        userId,
        stripePriceId: priceId,
        plan: BUSINESS_PLAN_KEY,
        status,
        interval,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
        trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
    };

    await db.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        create: { stripeSubscriptionId: subscription.id, ...data },
        update: data,
    });
}

async function fulfillSubscriptionCheckout(session: Stripe.Checkout.Session) {
    if (session.mode !== "subscription") return;

    const stripe = getStripe();
    if (!stripe) return;

    const subscriptionId =
        typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions
        .retrieve(subscriptionId)
        .catch(() => null);
    if (!subscription) return;

    await syncSubscription(subscription);
}

async function cancelSubscription(subscription: Stripe.Subscription) {
    await syncSubscription(subscription);
}

async function syncInvoiceSubscription(invoice: Stripe.Invoice) {
    const stripe = getStripe();
    if (!stripe) return;

    const raw = (
        invoice as unknown as { subscription?: string | { id: string } }
    ).subscription;
    const subscriptionId = typeof raw === "string" ? raw : raw?.id;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions
        .retrieve(subscriptionId)
        .catch(() => null);
    if (subscription) await syncSubscription(subscription);
}

async function syncSubscriptionsForCustomer(userId: string): Promise<number> {
    const stripe = getStripe();
    if (!stripe) return 0;

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return 0;

    const subscriptions = await stripe.subscriptions
        .list({ customer: user.stripeCustomerId, status: "all", limit: 100 })
        .catch(() => null);
    if (!subscriptions) return 0;

    for (const subscription of subscriptions.data) {
        await syncSubscription(subscription);
    }
    return subscriptions.data.length;
}

export {
    cancelSubscription,
    fulfillSubscriptionCheckout,
    syncInvoiceSubscription,
    syncSubscription,
    syncSubscriptionsForCustomer,
};
