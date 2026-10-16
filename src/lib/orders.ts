import "server-only";

import type Stripe from "stripe";

import { db } from "@/lib/db";
import { enrolInCourse } from "@/lib/enrolment";

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
    if (session.payment_status === "unpaid") {
        return { fulfilled: false, reason: "unpaid" as const };
    }

    const order = await db.order.findUnique({
        where: { stripeSessionId: session.id },
        include: {
            items: {
                select: {
                    id: true,
                    courseSlug: true,
                    courseId: true,
                    instructorId: true,
                    revenueShareBps: true,
                    unitAmount: true,
                },
            },
        },
    });

    if (!order) {
        return { fulfilled: false, reason: "unknown-order" as const };
    }

    if (order.status === "PAID") {
        return { fulfilled: false, reason: "already-fulfilled" as const };
    }

    const paymentIntentId =
        typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null);

    await db.$transaction([
        db.order.updateMany({
            where: { id: order.id, status: { not: "PAID" } },
            data: {
                status: "PAID",
                paidAt: new Date(),
                stripePaymentIntentId: paymentIntentId,
                amountTotal: session.amount_total ?? order.amountTotal,
                email: session.customer_details?.email ?? order.email,
            },
        }),
        db.cartItem.deleteMany({
            where: {
                userId: order.userId,
                courseSlug: { in: order.items.map((item) => item.courseSlug) },
            },
        }),
    ]);

    for (const item of order.items) {
        const courseId =
            item.courseId ??
            (
                await db.course.findUnique({
                    where: { slug: item.courseSlug },
                    select: { id: true },
                })
            )?.id;
        if (!courseId) continue;

        await enrolInCourse({
            userId: order.userId,
            courseId,
            source: "PURCHASE",
            orderId: order.id,
        }).catch((error) => {
            console.error("[fulfil] Enrolment Failed", item.courseSlug, error);
        });

        await recordEarning(item).catch((error) => {
            console.error("[fulfil] Earning Failed", item.courseSlug, error);
        });
    }

    return { fulfilled: true, orderId: order.id };
}

export async function failCheckoutSession(session: Stripe.Checkout.Session) {
    await db.order.updateMany({
        where: { stripeSessionId: session.id, status: "PENDING" },
        data: { status: "FAILED" },
    });
}

export async function expireCheckoutSession(session: Stripe.Checkout.Session) {
    await db.order.updateMany({
        where: { stripeSessionId: session.id, status: "PENDING" },
        data: { status: "EXPIRED" },
    });
}

const CLEARING_DAYS = 30;

async function recordEarning(item: {
    id: string;
    instructorId: string | null;
    revenueShareBps: number | null;
    unitAmount: number;
    courseId: string | null;
}) {
    if (!item.instructorId || item.revenueShareBps === null) return;

    const existing = await db.instructorEarning.findFirst({
        where: { orderItemId: item.id },
        select: { id: true },
    });
    if (existing) return;

    const gross = item.unitAmount;
    const net = Math.round((gross * item.revenueShareBps) / 10000);

    await db.instructorEarning.create({
        data: {
            instructorId: item.instructorId,
            courseId: item.courseId,
            source: "SALE",
            orderItemId: item.id,
            grossCents: gross,
            platformFeeCents: gross - net,
            netCents: net,
            status: "PENDING",
            clearsAt: new Date(
                Date.now() + CLEARING_DAYS * 24 * 60 * 60 * 1000,
            ),
        },
    });
}
