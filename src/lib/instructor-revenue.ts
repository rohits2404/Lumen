import { getSession } from "@/lib/auth";
import {
    EARNING_MONTHS,
    EARNINGS_BY_COURSE_LIMIT,
    PAYOUT_HISTORY_LIMIT,
} from "@/lib/config/instructor-revenue";
import { db } from "@/lib/db";
import type { PayoutMethodView } from "@/lib/instructor-payouts";
import type { PayoutStatus, Prisma } from "@/generated/prisma/client";

export type EarningMonth = {
    month: Date;
    cents: number;
};

export type EarningSeries = {
    months: EarningMonth[];
    totalCents: number;
    bestMonth: string | null;
    delta: number | null;
};

export type CourseEarningRow = {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
    cents: number;
    percent: number;
};

export type PayoutRow = {
    id: string;
    reference: string;
    date: string;
    method: string | null;
    amountCents: number;
    status: PayoutStatus;
    failureReason: string | null;
};

export type RevenueStats = {
    lifetimeCents: number;
    since: string | null;
    thisMonthCents: number;
    monthDelta: number | null;
    pendingCents: number;
    clearsInDays: number | null;
    perSaleCents: number | null;
};

export type RevenuePage = {
    availableCents: number;
    nextPayoutOn: string | null;
    primaryMethod: PayoutMethodView | null;
    payoutDayOfMonth: number;
    stats: RevenueStats;
    series: EarningSeries;
    byCourse: CourseEarningRow[];
    payouts: PayoutRow[];
    hasCourses: boolean;
    generatedAt: Date;
};

const DAY = 24 * 60 * 60 * 1000;

const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
});
const shortMonthYear = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});
const payoutDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});

function growth(now: number, before: number): number | null {
    if (before === 0) return null;
    return (now - before) / before;
}

function monthStart(monthsBack: number) {
    const now = new Date();
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1),
    );
}

function nextPayoutDate(day: number, now: Date): Date {
    const thisMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day),
    );
    return thisMonth > now
        ? thisMonth
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, day));
}

export async function getRevenuePage(): Promise<RevenuePage | null> {
    const session = await getSession();
    if (!session) return null;

    const instructor = await db.instructor.findUnique({
        where: { userId: session.user.id },
        select: {
            id: true,
            payoutDayOfMonth: true,
            payoutMethods: {
                where: { role: "PRIMARY" },
                orderBy: { createdAt: "asc" },
                take: 1,
                select: {
                    id: true,
                    type: true,
                    label: true,
                    last4: true,
                    currency: true,
                    role: true,
                    verifiedAt: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!instructor) return null;

    const now = new Date();
    const earned: Prisma.InstructorEarningWhereInput = {
        instructorId: instructor.id,
        status: { not: "REVERSED" },
    };
    const thisMonth = monthStart(0);
    const lastMonth = monthStart(1);

    const [
        courseCount,
        available,
        lifetime,
        firstEarning,
        month,
        priorMonth,
        pending,
        furthestPending,
        perSale,
    ] = await Promise.all([
        db.course.count({ where: { instructorId: instructor.id } }),
        db.instructorEarning.aggregate({
            where: { instructorId: instructor.id, status: "AVAILABLE" },
            _sum: { netCents: true },
        }),
        db.instructorEarning.aggregate({
            where: earned,
            _sum: { netCents: true },
        }),
        db.instructorEarning.findFirst({
            where: earned,
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
        }),
        db.instructorEarning.aggregate({
            where: { ...earned, createdAt: { gte: thisMonth } },
            _sum: { netCents: true },
        }),
        db.instructorEarning.aggregate({
            where: { ...earned, createdAt: { gte: lastMonth, lt: thisMonth } },
            _sum: { netCents: true },
        }),
        db.instructorEarning.aggregate({
            where: { instructorId: instructor.id, status: "PENDING" },
            _sum: { netCents: true },
        }),
        db.instructorEarning.findFirst({
            where: {
                instructorId: instructor.id,
                status: "PENDING",
                clearsAt: { not: null },
            },
            orderBy: { clearsAt: "desc" },
            select: { clearsAt: true },
        }),
        db.instructorEarning.aggregate({
            where: { ...earned, source: "SALE" },
            _sum: { netCents: true },
            _count: { _all: true },
        }),
    ]);

    const seriesFrom = monthStart(EARNING_MONTHS);
    const seriesUntil = monthStart(0);

    const [monthRows, courseGroups, payoutRows] = await Promise.all([
        db.$queryRaw<{ month: Date; cents: bigint | number }[]>`
      SELECT date_trunc('month', "createdAt" AT TIME ZONE 'UTC') AS month,
             SUM("netCents")::bigint AS cents
      FROM "instructor_earning"
      WHERE "instructorId" = ${instructor.id}
        AND status <> 'REVERSED'
        AND "createdAt" >= ${seriesFrom}
        AND "createdAt" < ${seriesUntil}
      GROUP BY 1
      ORDER BY 1
    `,
        db.instructorEarning.groupBy({
            by: ["courseId"],
            where: { ...earned, createdAt: { gte: thisMonth } },
            _sum: { netCents: true },
        }),
        db.payout.findMany({
            where: { instructorId: instructor.id },
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            take: PAYOUT_HISTORY_LIMIT,
            select: {
                id: true,
                reference: true,
                amountCents: true,
                status: true,
                failureReason: true,
                paidAt: true,
                createdAt: true,
                payoutMethod: {
                    select: { type: true, label: true, last4: true },
                },
            },
        }),
    ]);

    const byMonth = new Map<number, number>();
    for (const row of monthRows) {
        const key = Date.UTC(row.month.getFullYear(), row.month.getMonth(), 1);
        byMonth.set(key, Number(row.cents));
    }
    const months: EarningMonth[] = Array.from(
        { length: EARNING_MONTHS },
        (_, index) => {
            const month = monthStart(EARNING_MONTHS - index);
            return { month, cents: byMonth.get(month.getTime()) ?? 0 };
        },
    );
    const best = months.reduce<EarningMonth | null>(
        (top, entry) => (top === null || entry.cents > top.cents ? entry : top),
        null,
    );

    const monthTotal = month._sum.netCents ?? 0;
    const rankedCourses = courseGroups
        .flatMap((group) =>
            group.courseId === null || (group._sum.netCents ?? 0) <= 0
                ? []
                : [
                      {
                          courseId: group.courseId,
                          cents: group._sum.netCents ?? 0,
                      },
                  ],
        )
        .sort(
            (a, b) => b.cents - a.cents || a.courseId.localeCompare(b.courseId),
        )
        .slice(0, EARNINGS_BY_COURSE_LIMIT);

    const courseRows =
        rankedCourses.length === 0
            ? []
            : await db.course.findMany({
                  where: {
                      id: { in: rankedCourses.map((row) => row.courseId) },
                  },
                  select: {
                      id: true,
                      title: true,
                      thumbnailUrl: true,
                      category: { select: { slug: true, accentColor: true } },
                  },
              });
    const courseById = new Map(courseRows.map((row) => [row.id, row]));

    const availableCents = available._sum.netCents ?? 0;
    const pendingCents = pending._sum.netCents ?? 0;
    const saleCount = perSale._count._all;

    return {
        availableCents,
        nextPayoutOn:
            availableCents <= 0
                ? null
                : payoutDate.format(
                      nextPayoutDate(instructor.payoutDayOfMonth, now),
                  ),
        primaryMethod:
            instructor.payoutMethods.length === 0
                ? null
                : {
                      id: instructor.payoutMethods[0]!.id,
                      type: instructor.payoutMethods[0]!.type,
                      label: instructor.payoutMethods[0]!.label,
                      last4: instructor.payoutMethods[0]!.last4,
                      currency: instructor.payoutMethods[0]!.currency,
                      role: instructor.payoutMethods[0]!.role,
                      verified:
                          instructor.payoutMethods[0]!.verifiedAt !== null,
                      addedOn: shortMonthYear.format(
                          instructor.payoutMethods[0]!.createdAt,
                      ),
                  },
        payoutDayOfMonth: instructor.payoutDayOfMonth,
        stats: {
            lifetimeCents: lifetime._sum.netCents ?? 0,
            since:
                firstEarning === null
                    ? null
                    : shortMonthYear.format(firstEarning.createdAt),
            thisMonthCents: monthTotal,
            monthDelta: growth(monthTotal, priorMonth._sum.netCents ?? 0),
            pendingCents,
            clearsInDays:
                furthestPending?.clearsAt == null
                    ? null
                    : Math.max(
                          0,
                          Math.ceil(
                              (furthestPending.clearsAt.getTime() -
                                  now.getTime()) /
                                  DAY,
                          ),
                      ),
            perSaleCents:
                saleCount === 0
                    ? null
                    : Math.round((perSale._sum.netCents ?? 0) / saleCount),
        },
        series: {
            months,
            totalCents: months.reduce((sum, entry) => sum + entry.cents, 0),
            bestMonth:
                best === null || best.cents === 0
                    ? null
                    : monthName.format(best.month),
            delta: growth(months.at(-1)?.cents ?? 0, months.at(-2)?.cents ?? 0),
        },
        byCourse: rankedCourses.flatMap((row) => {
            const course = courseById.get(row.courseId);
            if (!course) return [];
            return [
                {
                    id: course.id,
                    title: course.title,
                    thumbnailUrl: course.thumbnailUrl,
                    categorySlug: course.category.slug,
                    categoryAccent: course.category.accentColor,
                    cents: row.cents,
                    percent:
                        monthTotal === 0
                            ? 0
                            : Math.round((row.cents / monthTotal) * 1000) / 10,
                },
            ];
        }),
        payouts: payoutRows.map((row) => ({
            id: row.id,
            reference: row.reference,
            date: payoutDate.format(row.paidAt ?? row.createdAt),
            method:
                row.payoutMethod === null
                    ? null
                    : row.payoutMethod.type === "PAYPAL"
                      ? `PayPal · ${row.payoutMethod.label}`
                      : `Bank · ••••${row.payoutMethod.last4 ?? "????"}`,
            amountCents: row.amountCents,
            status: row.status,
            failureReason: row.failureReason,
        })),
        hasCourses: courseCount > 0,
        generatedAt: now,
    };
}
