import { cache } from "react";

import { db } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
export const REVENUE_MONTHS = 6;

export type ReportStat = {
    value: number | null;
    delta: number | null;
};

export type ReportStats = {
    revenue: ReportStat;
    platformShare: ReportStat;
    signups: ReportStat;
    refundRate: ReportStat;
};

export type RevenueMonth = {
    month: Date;
    cents: number;
};

export type RevenueSeries = {
    months: RevenueMonth[];
    totalCents: number;
    delta: number | null;
};

export type PayoutRunRow = {
    id: string;
    reference: string;
    scheduledFor: Date;
    status: "SCHEDULED" | "PROCESSING" | "COMPLETED" | "PARTIALLY_FAILED";
    totalCents: number;
    recipientCount: number;
    failedCount: number;
};

export type PayoutRunRecipient = {
    id: string;
    name: string;
    imageUrl: string | null;
    methodLabel: string | null;
    methodLast4: string | null;
    methodType: "BANK_TRANSFER" | "PAYPAL" | "STRIPE" | null;
    amountCents: number;
    status: "PENDING" | "PAID" | "FAILED";
};

export type PayoutRunDetail = PayoutRunRow & {
    recipients: PayoutRunRecipient[];
    averageCents: number | null;
};

function growth(now: number, then: number) {
    if (then <= 0) return null;
    return (now - then) / then;
}

export const getReportStats = cache(
    async function getReportStats(): Promise<ReportStats> {
        const cutoff = new Date(Date.now() - WINDOW_DAYS * DAY);
        const previousCutoff = new Date(cutoff.getTime() - WINDOW_DAYS * DAY);

        const [
            revenue,
            revenueBefore,
            share,
            shareBefore,
            signups,
            signupsBefore,
            refunds,
            refundsBefore,
            paidOrders,
            paidOrdersBefore,
        ] = await Promise.all([
            db.order.aggregate({
                where: { status: "PAID" },
                _sum: { amountTotal: true },
            }),
            db.order.aggregate({
                where: { status: "PAID", paidAt: { lt: cutoff } },
                _sum: { amountTotal: true },
            }),
            db.instructorEarning.aggregate({
                where: { status: { not: "REVERSED" } },
                _sum: { platformFeeCents: true },
            }),
            db.instructorEarning.aggregate({
                where: {
                    status: { not: "REVERSED" },
                    createdAt: { lt: cutoff },
                },
                _sum: { platformFeeCents: true },
            }),
            db.user.count({ where: { createdAt: { gte: cutoff } } }),
            db.user.count({
                where: { createdAt: { gte: previousCutoff, lt: cutoff } },
            }),
            db.refund.count({ where: { createdAt: { gte: cutoff } } }),
            db.refund.count({
                where: { createdAt: { gte: previousCutoff, lt: cutoff } },
            }),
            db.order.count({
                where: { status: "PAID", paidAt: { gte: cutoff } },
            }),
            db.order.count({
                where: {
                    status: "PAID",
                    paidAt: { gte: previousCutoff, lt: cutoff },
                },
            }),
        ]);

        const revenueTotal = revenue._sum.amountTotal ?? 0;
        const revenueThen = revenueBefore._sum.amountTotal ?? 0;
        const shareTotal = share._sum.platformFeeCents ?? 0;
        const shareThen = shareBefore._sum.platformFeeCents ?? 0;

        const rate = paidOrders > 0 ? refunds / paidOrders : null;
        const rateBefore =
            paidOrdersBefore > 0 ? refundsBefore / paidOrdersBefore : null;

        return {
            revenue: {
                value: revenueTotal,
                delta: growth(revenueTotal, revenueThen),
            },
            platformShare: {
                value: shareTotal,
                delta: growth(shareTotal, shareThen),
            },
            signups: { value: signups, delta: growth(signups, signupsBefore) },
            refundRate: {
                value: rate,
                delta:
                    rate !== null && rateBefore !== null
                        ? rate - rateBefore
                        : null,
            },
        };
    },
);

function monthStart(monthsBack: number) {
    const now = new Date();
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1),
    );
}

export const getRevenueByMonth = cache(
    async function getRevenueByMonth(): Promise<RevenueSeries> {
        const from = monthStart(REVENUE_MONTHS);
        const until = monthStart(0);

        const rows = await db.$queryRaw<
            { month: Date; cents: bigint | number }[]
        >`
    SELECT date_trunc('month', "paidAt" AT TIME ZONE 'UTC') AS month,
           SUM("amountTotal")::bigint AS cents
    FROM "order"
    WHERE status = 'PAID' AND "paidAt" >= ${from} AND "paidAt" < ${until}
    GROUP BY 1
    ORDER BY 1
  `;

        const byMonth = new Map<number, number>();
        for (const row of rows) {
            const month = Date.UTC(
                row.month.getFullYear(),
                row.month.getMonth(),
                1,
            );
            byMonth.set(month, Number(row.cents));
        }

        const months: RevenueMonth[] = Array.from(
            { length: REVENUE_MONTHS },
            (_, index) => {
                const month = monthStart(REVENUE_MONTHS - index);
                return { month, cents: byMonth.get(month.getTime()) ?? 0 };
            },
        );

        const totalCents = months.reduce((sum, entry) => sum + entry.cents, 0);
        const last = months.at(-1)?.cents ?? 0;
        const previous = months.at(-2)?.cents ?? 0;

        return { months, totalCents, delta: growth(last, previous) };
    },
);

export const getPayoutRuns = cache(async function getPayoutRuns(
    limit = 12,
): Promise<PayoutRunRow[]> {
    const runs = await db.payoutRun.findMany({
        orderBy: { scheduledFor: "desc" },
        take: limit,
        select: {
            id: true,
            reference: true,
            scheduledFor: true,
            status: true,
            totalCents: true,
            recipientCount: true,
        },
    });

    if (runs.length === 0) return [];

    const failures = await db.payout.groupBy({
        by: ["payoutRunId"],
        where: {
            status: "FAILED",
            payoutRunId: { in: runs.map((run) => run.id) },
        },
        _count: { _all: true },
    });

    const failedByRun = new Map(
        failures.map((row) => [row.payoutRunId, row._count._all]),
    );

    return runs.map((run) => ({
        ...run,
        failedCount: failedByRun.get(run.id) ?? 0,
    }));
});

export const getPayoutRun = cache(async function getPayoutRun(
    id: string,
): Promise<PayoutRunDetail | null> {
    const run = await db.payoutRun.findUnique({
        where: { id },
        select: {
            id: true,
            reference: true,
            scheduledFor: true,
            status: true,
            totalCents: true,
            recipientCount: true,
            payouts: {
                orderBy: { amountCents: "desc" },
                select: {
                    id: true,
                    amountCents: true,
                    status: true,
                    instructor: {
                        select: {
                            name: true,
                            imageUrl: true,
                            user: { select: { image: true } },
                        },
                    },
                    payoutMethod: {
                        select: { type: true, label: true, last4: true },
                    },
                },
            },
        },
    });

    if (!run) return null;

    const { payouts, ...rest } = run;
    const recipients: PayoutRunRecipient[] = payouts.map((payout) => ({
        id: payout.id,
        name: payout.instructor.name,
        imageUrl:
            payout.instructor.imageUrl ?? payout.instructor.user?.image ?? null,
        methodType: payout.payoutMethod?.type ?? null,
        methodLabel: payout.payoutMethod?.label ?? null,
        methodLast4: payout.payoutMethod?.last4 ?? null,
        amountCents: payout.amountCents,
        status: payout.status,
    }));

    return {
        ...rest,
        failedCount: recipients.filter((row) => row.status === "FAILED").length,
        recipients,
        averageCents:
            run.recipientCount > 0 && run.totalCents > 0
                ? Math.round(run.totalCents / run.recipientCount)
                : null,
    };
});
