"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export type BillingActionResult = { ok: boolean; message: string };

const NOT_CONFIGURED =
    "Billing Isn't Configured For This Environment Yet." as const;

async function ownsPaymentMethod(customerId: string, paymentMethodId: string) {
    const stripe = getStripe();
    if (!stripe) return false;

    const method = await stripe.paymentMethods
        .retrieve(paymentMethodId)
        .catch(() => null);
    if (!method) return false;

    const owner =
        typeof method.customer === "string"
            ? method.customer
            : (method.customer?.id ?? null);

    return owner === customerId;
}

export async function createSetupIntent(): Promise<
    { ok: true; clientSecret: string } | { ok: false; message: string }
> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Add A Card." };

    const stripe = getStripe();
    if (!stripe) return { ok: false, message: NOT_CONFIGURED };

    const customerId = await getOrCreateStripeCustomer();
    if (!customerId) return { ok: false, message: NOT_CONFIGURED };

    const intent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session",
        metadata: { userId: session.user.id },
    });

    if (!intent.client_secret) {
        return { ok: false, message: "Stripe Did Not Return A Client Secret." };
    }

    return { ok: true, clientSecret: intent.client_secret };
}

export async function syncPaymentMethods(): Promise<BillingActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Manage Billing." };

    const stripe = getStripe();
    if (!stripe) return { ok: false, message: NOT_CONFIGURED };

    const customerId = await db.user
        .findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true },
        })
        .then((user) => user?.stripeCustomerId ?? null);
    if (!customerId) return { ok: false, message: NOT_CONFIGURED };

    const [customer, methods] = await Promise.all([
        stripe.customers.retrieve(customerId).catch(() => null),
        stripe.paymentMethods
            .list({ customer: customerId, type: "card", limit: 20 })
            .catch(() => null),
    ]);

    const hasDefault =
        customer && !customer.deleted
            ? Boolean(customer.invoice_settings?.default_payment_method)
            : false;

    if (!hasDefault && methods?.data.length) {
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: methods.data[0]!.id },
        });
    }

    revalidatePath("/dashboard/settings/billing");
    return { ok: true, message: "Payment Method Added." };
}

export async function setDefaultPaymentMethod(
    paymentMethodId: string,
): Promise<BillingActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Manage Billing." };

    const stripe = getStripe();
    if (!stripe) return { ok: false, message: NOT_CONFIGURED };

    const customerId = await db.user
        .findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true },
        })
        .then((user) => user?.stripeCustomerId ?? null);
    if (!customerId) return { ok: false, message: NOT_CONFIGURED };

    if (!(await ownsPaymentMethod(customerId, paymentMethodId))) {
        return { ok: false, message: "That Card Isn't On Your Account." };
    }

    await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
    });

    revalidatePath("/dashboard/settings/billing");
    return { ok: true, message: "Primary Card Updated." };
}

export async function removePaymentMethod(
    paymentMethodId: string,
): Promise<BillingActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Manage Billing." };

    const stripe = getStripe();
    if (!stripe) return { ok: false, message: NOT_CONFIGURED };

    const customerId = await db.user
        .findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true },
        })
        .then((user) => user?.stripeCustomerId ?? null);
    if (!customerId) return { ok: false, message: NOT_CONFIGURED };

    if (!(await ownsPaymentMethod(customerId, paymentMethodId))) {
        return { ok: false, message: "That Card Isn't On Your Account." };
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    const remaining = await stripe.paymentMethods
        .list({ customer: customerId, type: "card", limit: 20 })
        .catch(() => null);
    if (remaining?.data.length) {
        const customer = await stripe.customers
            .retrieve(customerId)
            .catch(() => null);
        const stillDefault =
            customer && !customer.deleted
                ? Boolean(customer.invoice_settings?.default_payment_method)
                : false;
        if (!stillDefault) {
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: remaining.data[0]!.id,
                },
            });
        }
    }

    revalidatePath("/dashboard/settings/billing");
    return { ok: true, message: "Card Removed." };
}

export async function createBillingPortalSession(): Promise<
    { ok: true; url: string } | { ok: false; message: string }
> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Manage Billing." };

    const stripe = getStripe();
    if (!stripe) return { ok: false, message: NOT_CONFIGURED };

    const origin = process.env.BETTER_AUTH_URL;
    if (!origin) {
        return { ok: false, message: "BETTER_AUTH_URL Must Be Set." };
    }

    const customerId = await getOrCreateStripeCustomer();
    if (!customerId) return { ok: false, message: NOT_CONFIGURED };

    try {
        const portal = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/dashboard/settings/billing`,
        });
        return { ok: true, url: portal.url };
    } catch {
        return {
            ok: false,
            message:
                "The Stripe Customer Portal Isn't Set Up Yet. Configure It In The Stripe Dashboard Under Settings → Billing.",
        };
    }
}
