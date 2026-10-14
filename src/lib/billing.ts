import "server-only";

import type Stripe from "stripe";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { OrderStatus } from "@/generated/prisma/client";

export type BillingCard = {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    name: string | null;
    isDefault: boolean;
};

export type BillingPlan = {
    interval: string;
    amountCents: number | null;
    currency: string;
    nextPaymentAt: Date | null;
    status: Stripe.Subscription.Status;
    cancelAtPeriodEnd: boolean;
};

export type BillingTransaction = {
    id: string;
    reference: string;
    product: string;
    status: OrderStatus;
    date: Date;
    amountCents: number;
    currency: string;
};

export type Billing = {
    configured: boolean;
    plan: BillingPlan | null;
    cards: BillingCard[];
    transactions: BillingTransaction[];
};

export const TRANSACTIONS_LIMIT = 50;

export function orderReference(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) % 100000;
    }
    return `#${String(hash).padStart(5, "0")}`;
}

export async function getOrCreateStripeCustomer(): Promise<string | null> {
    const session = await getSession();
    if (!session) return null;

    const stripe = getStripe();
    if (!stripe) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true, email: true, name: true },
    });
    if (!user) return null;

    if (user.stripeCustomerId) {
        const existing = await stripe.customers
            .retrieve(user.stripeCustomerId)
            .catch(() => null);
        if (existing && !existing.deleted) return existing.id;
    }

    const created = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: session.user.id },
    });

    await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: created.id },
    });

    return created.id;
}

async function readStripeCustomerId(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
    });
    return user?.stripeCustomerId ?? null;
}

function intervalLabel(price: Stripe.Price | null | undefined) {
    const recurring = price?.recurring;
    if (!recurring) return "monthly";

    const singular: Record<string, string> = {
        day: "daily",
        week: "weekly",
        month: "monthly",
        year: "annually",
    };

    const count = recurring.interval_count ?? 1;
    if (count === 1) {
        return singular[recurring.interval] ?? `every ${recurring.interval}`;
    }
    return `every ${count} ${recurring.interval}s`;
}

async function readPlan(
    stripe: Stripe,
    customerId: string,
): Promise<BillingPlan | null> {
    const subscriptions = await stripe.subscriptions
        .list({
            customer: customerId,
            status: "all",
            limit: 10,
            expand: ["data.items.data.price"],
        })
        .catch(() => null);
    if (!subscriptions) return null;

    const live = subscriptions.data.find((subscription) =>
        ["active", "trialing", "past_due", "unpaid"].includes(
            subscription.status,
        ),
    );
    if (!live) return null;

    const item = live.items.data[0];
    const price = item?.price;
    const periodEnd =
        (item as { current_period_end?: number } | undefined)
            ?.current_period_end ??
        (live as unknown as { current_period_end?: number })
            .current_period_end ??
        null;

    const unit = price?.unit_amount ?? null;
    const quantity = item?.quantity ?? 1;

    return {
        interval: intervalLabel(price),
        amountCents: unit === null ? null : unit * quantity,
        currency: price?.currency ?? "usd",
        nextPaymentAt: periodEnd ? new Date(periodEnd * 1000) : null,
        status: live.status,
        cancelAtPeriodEnd: live.cancel_at_period_end,
    };
}

async function readCards(
    stripe: Stripe,
    customerId: string,
): Promise<BillingCard[]> {
    const [customer, methods] = await Promise.all([
        stripe.customers.retrieve(customerId).catch(() => null),
        stripe.paymentMethods
            .list({ customer: customerId, type: "card", limit: 20 })
            .catch(() => null),
    ]);
    if (!methods) return [];

    const defaultId =
        customer && !customer.deleted
            ? typeof customer.invoice_settings?.default_payment_method ===
              "string"
                ? customer.invoice_settings.default_payment_method
                : (customer.invoice_settings?.default_payment_method?.id ??
                  null)
            : null;

    const customerName =
        customer && !customer.deleted ? (customer.name ?? null) : null;

    const cards = methods.data.flatMap<BillingCard>((method) => {
        const card = method.card;
        if (!card) return [];
        return [
            {
                id: method.id,
                brand: card.brand,
                last4: card.last4,
                expMonth: card.exp_month,
                expYear: card.exp_year,
                name: method.billing_details?.name ?? customerName,
                isDefault: method.id === defaultId,
            },
        ];
    });

    return cards.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

const INVOICE_STATUS: Record<string, OrderStatus> = {
    paid: "PAID",
    open: "PENDING",
    void: "FAILED",
    uncollectible: "FAILED",
};

async function readInvoices(
    stripe: Stripe,
    customerId: string,
    take: number,
): Promise<BillingTransaction[]> {
    const invoices = await stripe.invoices
        .list({ customer: customerId, limit: Math.min(take, 100) })
        .catch(() => null);
    if (!invoices) return [];

    const rows: BillingTransaction[] = [];
    for (const invoice of invoices.data) {
        const status = INVOICE_STATUS[invoice.status ?? ""];
        if (!status) continue;

        const line = invoice.lines?.data?.[0];
        rows.push({
            id: invoice.id ?? `invoice_${invoice.number}`,
            reference: invoice.number ?? "—",
            product: line?.description ?? "Lumen Business",
            status,
            date: new Date(
                (invoice.status_transitions?.paid_at ?? invoice.created) * 1000,
            ),
            amountCents: invoice.amount_paid || invoice.amount_due,
            currency: invoice.currency,
        });
    }
    return rows;
}

async function readOrders(
    userId: string,
    take: number,
): Promise<BillingTransaction[]> {
    const orders = await db.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take,
        select: {
            id: true,
            status: true,
            amountTotal: true,
            currency: true,
            createdAt: true,
            paidAt: true,
            items: { select: { title: true } },
        },
    });

    return orders.map((order) => ({
        id: order.id,
        reference: orderReference(order.id),
        product:
            order.items.length === 0
                ? "Course purchase"
                : order.items.length === 1
                  ? order.items[0]!.title
                  : `${order.items[0]!.title} + ${order.items.length - 1} more`,
        status: order.status,
        date: order.paidAt ?? order.createdAt,
        amountCents: order.amountTotal,
        currency: order.currency,
    }));
}

async function readTransactions(
    userId: string,
    customerId: string | null,
    take: number,
): Promise<BillingTransaction[]> {
    const stripe = getStripe();
    const [orders, invoices] = await Promise.all([
        readOrders(userId, take),
        stripe && customerId ? readInvoices(stripe, customerId, take) : [],
    ]);

    return [...orders, ...invoices]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, take);
}

export async function getBilling(
    take = TRANSACTIONS_LIMIT,
): Promise<Billing | null> {
    const session = await getSession();
    if (!session) return null;

    const stripe = getStripe();
    if (!stripe) {
        const transactions = await readTransactions(
            session.user.id,
            null,
            take,
        );
        return { configured: false, plan: null, cards: [], transactions };
    }

    const customerId = await readStripeCustomerId(session.user.id);

    const [transactions, plan, cards] = await Promise.all([
        readTransactions(session.user.id, customerId, take),
        customerId ? readPlan(stripe, customerId) : null,
        customerId ? readCards(stripe, customerId) : [],
    ]);

    return { configured: true, plan, cards, transactions };
}
