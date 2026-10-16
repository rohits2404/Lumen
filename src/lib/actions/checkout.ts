"use server";

import type Stripe from "stripe";

import { getSession } from "@/lib/auth";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { getCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { getPlatformSettings } from "@/lib/admin/settings";
import { getStripe } from "@/lib/stripe";

function toCents(price: number) {
    return Math.round(price * 100);
}

const INTEGRATION_IDENTIFIER = "lumen-cart-checkout-qwbtmxhd";

const REUSE_WINDOW_MS = 60 * 60 * 1000;

const EXCLUDED_PAYMENT_METHODS = [
    "cashapp",
    "klarna",
    "us_bank_account",
] as const;

function sameExclusions(session: Stripe.Checkout.Session) {
    const applied = [...(session.excluded_payment_method_types ?? [])].sort();

    return (
        applied.length === EXCLUDED_PAYMENT_METHODS.length &&
        applied.every((type, i) => type === EXCLUDED_PAYMENT_METHODS[i])
    );
}

const ELEMENTS_UI_MODES = new Set(["elements", "custom"]);

function savesToCustomer(session: Stripe.Checkout.Session) {
    const customerId =
        typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? null);

    return (
        customerId !== null &&
        session.saved_payment_method_options?.payment_method_save === "enabled"
    );
}

export async function createCheckoutSession(): Promise<string> {
    const session = await getSession();
    if (!session) {
        throw new Error("Sign in to check out.");
    }

    const stripe = getStripe();
    if (!stripe) {
        throw new Error("Checkout is not configured.");
    }

    const cart = await getCart();
    if (cart.lines.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const customerId = await getOrCreateStripeCustomer();
    if (!customerId) {
        throw new Error("Checkout is not configured.");
    }

    const origin = process.env.BETTER_AUTH_URL;
    if (!origin) {
        throw new Error("BETTER_AUTH_URL must be set to build the return URL.");
    }

    const slugs = cart.lines.map((line) => line.course.slug).sort();

    const existing = await db.order.findFirst({
        where: {
            userId: session.user.id,
            status: "PENDING",
            createdAt: { gt: new Date(Date.now() - REUSE_WINDOW_MS) },
        },
        orderBy: { createdAt: "desc" },
        include: { items: { select: { courseSlug: true } } },
    });

    if (existing) {
        const sameCart =
            existing.items.length === slugs.length &&
            existing.items
                .map((item) => item.courseSlug)
                .sort()
                .every((slug, i) => slug === slugs[i]);

        if (sameCart) {
            const reopened = await stripe.checkout.sessions
                .retrieve(existing.stripeSessionId)
                .catch(() => null);

            if (
                reopened?.status === "open" &&
                reopened.client_secret &&
                ELEMENTS_UI_MODES.has(String(reopened.ui_mode)) &&
                sameExclusions(reopened) &&
                savesToCustomer(reopened)
            ) {
                return reopened.client_secret;
            }
        }
    }

    const { defaultRevenueShareBps: shareBps } = await getPlatformSettings();

    const checkout = await stripe.checkout.sessions.create({
        ui_mode: "elements",
        mode: "payment",
        integration_identifier: INTEGRATION_IDENTIFIER,
        return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        customer: customerId,
        saved_payment_method_options: { payment_method_save: "enabled" },
        excluded_payment_method_types: [...EXCLUDED_PAYMENT_METHODS],
        line_items: cart.lines.map((line) => ({
            quantity: 1,
            price_data: {
                currency: "usd",
                unit_amount: toCents(line.course.price),
                product_data: {
                    name: line.course.title,
                    description: line.course.instructor,
                },
            },
        })),
        metadata: { userId: session.user.id },
    });

    if (!checkout.client_secret) {
        throw new Error("Stripe did not return a client secret.");
    }

    await db.order.create({
        data: {
            userId: session.user.id,
            stripeSessionId: checkout.id,
            amountTotal: checkout.amount_total ?? 0,
            currency: checkout.currency ?? "usd",
            email: session.user.email,
            items: {
                create: cart.lines.map((line) => ({
                    courseSlug: line.course.slug,
                    courseId: line.course.id,
                    instructorId: line.course.instructorId,
                    revenueShareBps: shareBps,
                    title: line.course.title,
                    unitAmount: toCents(line.course.price),
                })),
            },
        },
    });

    return checkout.client_secret;
}
