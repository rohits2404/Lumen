import "server-only";

import { cache } from "react";

import { getSession } from "@/lib/auth";
import {
    type BillingPeriod,
    type BusinessOffer,
    BUSINESS_PLAN_ID,
    plans,
} from "@/lib/config/pricing";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { SubscriptionStatus } from "@/generated/prisma/client";

const ENTITLED_STATUSES: SubscriptionStatus[] = [
    "ACTIVE",
    "TRIALING",
    "PAST_DUE",
];

function businessPriceId(period: BillingPeriod): string | null {
    const value =
        period === "yearly"
            ? process.env.STRIPE_BUSINESS_PRICE_YEARLY
            : process.env.STRIPE_BUSINESS_PRICE_MONTHLY;
    return value?.trim() ? value.trim() : null;
}

function isBusinessConfigured(): boolean {
    return Boolean(
        getStripe() && businessPriceId("monthly") && businessPriceId("yearly"),
    );
}

const getBusinessSubscription = cache(async function getBusinessSubscription() {
    const session = await getSession();
    if (!session) return null;

    return db.subscription.findFirst({
        where: { userId: session.user.id, status: { in: ENTITLED_STATUSES } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            status: true,
            interval: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
        },
    });
});

async function hasBusinessPlan(): Promise<boolean> {
    return (await getBusinessSubscription()) !== null;
}

async function userHasBusinessPlan(userId: string): Promise<boolean> {
    const row = await db.subscription.findFirst({
        where: { userId, status: { in: ENTITLED_STATUSES } },
        select: { id: true },
    });
    return row !== null;
}

const PRICE_TTL_MS = 5 * 60 * 1000;
let priceCache: { at: number; value: Record<BillingPeriod, string> } | null =
    null;

async function livePrices(): Promise<Record<BillingPeriod, string> | null> {
    const stripe = getStripe();
    if (!stripe) return null;

    if (priceCache && Date.now() - priceCache.at < PRICE_TTL_MS) {
        return priceCache.value;
    }

    const ids = {
        monthly: businessPriceId("monthly"),
        yearly: businessPriceId("yearly"),
    };
    if (!ids.monthly || !ids.yearly) return null;

    try {
        const [monthly, yearly] = await Promise.all([
            stripe.prices.retrieve(ids.monthly),
            stripe.prices.retrieve(ids.yearly),
        ]);
        const value = {
            monthly: formatPrice(monthly.unit_amount, monthly.currency),
            yearly: formatPrice(yearly.unit_amount, yearly.currency),
        };
        if (!value.monthly || !value.yearly) return null;

        priceCache = {
            at: Date.now(),
            value: value as Record<BillingPeriod, string>,
        };
        return priceCache.value;
    } catch {
        return null;
    }
}

function formatPrice(amount: number | null, currency: string): string | null {
    if (amount === null) return null;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    }).format(amount / 100);
}

async function getBusinessOffer(): Promise<BusinessOffer> {
    const fallback = plans.find((plan) => plan.id === BUSINESS_PLAN_ID);
    const suffix = fallback?.suffix ?? { monthly: "/month", yearly: "/year" };
    const configured = isBusinessConfigured();

    const [session, subscription, live] = await Promise.all([
        getSession(),
        configured ? getBusinessSubscription() : Promise.resolve(null),
        configured ? livePrices() : Promise.resolve(null),
    ]);

    const price = live ?? fallback?.price ?? { monthly: "$29", yearly: "$299" };

    const state = !configured
        ? "unconfigured"
        : !session
          ? "anonymous"
          : subscription
            ? "subscribed"
            : "available";

    return { state, price, suffix };
}

export {
    businessPriceId,
    ENTITLED_STATUSES,
    getBusinessOffer,
    getBusinessSubscription,
    hasBusinessPlan,
    isBusinessConfigured,
    userHasBusinessPlan,
};
