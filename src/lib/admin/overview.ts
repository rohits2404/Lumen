import { cache } from "react";
import { db } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

export type PlatformStat = {
    value: number;
    delta: number | null;
};

export type PlatformStats = {
    users: PlatformStat;
    courses: PlatformStat;
    revenue: PlatformStat;
    uptime: { value: number | null; delta: number | null };
};

export type AttentionFacts = {
    coursesAwaitingReview: {
        count: number;
        oldestSubmittedAt: Date | null;
    };
    instructorApplications: {
        count: number;
        oldestCreatedAt: Date | null;
        allThisWeek: boolean;
    };
    reportedReviews: {
        count: number;
        byInstructors: number;
        byOthers: number;
    };
    failedPayouts: {
        count: number;
        retryScheduledFor: Date | null;
    };
};

export type TopCourse = {
    slug: string;
    title: string;
    categoryName: string;
    categoryAccent: string;
    categorySlug: string;
    rating: number;
    enrollmentCount: number;
};

function growth(now: number, then: number) {
    if (then <= 0) return null;
    return (now - then) / then;
}

export async function getPlatformStats(): Promise<PlatformStats> {
    const cutoff = new Date(Date.now() - WINDOW_DAYS * DAY);

    const [
        users,
        usersBefore,
        courses,
        coursesBefore,
        revenue,
        revenueBefore,
        uptime,
    ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { createdAt: { lt: cutoff } } }),
        db.course.count({ where: { status: "PUBLISHED" } }),
        db.course.count({
            where: { status: "PUBLISHED", publishedAt: { lt: cutoff } },
        }),
        db.order.aggregate({
            where: { status: "PAID" },
            _sum: { amountTotal: true },
        }),
        db.order.aggregate({
            where: { status: "PAID", paidAt: { lt: cutoff } },
            _sum: { amountTotal: true },
        }),
        getUptime(cutoff),
    ]);

    const revenueTotal = revenue._sum.amountTotal ?? 0;
    const revenueThen = revenueBefore._sum.amountTotal ?? 0;

    return {
        users: { value: users, delta: growth(users, usersBefore) },
        courses: { value: courses, delta: growth(courses, coursesBefore) },
        revenue: {
            value: revenueTotal,
            delta: growth(revenueTotal, revenueThen),
        },
        uptime,
    };
}

async function getUptime(cutoff: Date) {
    const previousCutoff = new Date(cutoff.getTime() - WINDOW_DAYS * DAY);

    const [recent, previous] = await Promise.all([
        db.uptimeSample.aggregate({
            where: { day: { gte: cutoff } },
            _sum: { checksOk: true, checksTotal: true },
        }),
        db.uptimeSample.aggregate({
            where: { day: { gte: previousCutoff, lt: cutoff } },
            _sum: { checksOk: true, checksTotal: true },
        }),
    ]);

    const ratio = (sums: {
        checksOk: number | null;
        checksTotal: number | null;
    }) => (sums.checksTotal ? (sums.checksOk ?? 0) / sums.checksTotal : null);

    const value = ratio(recent._sum);
    const before = ratio(previous._sum);

    return {
        value,
        delta: value !== null && before !== null ? value - before : null,
    };
}

export const getAttentionFacts = cache(
    async function getAttentionFacts(): Promise<AttentionFacts> {
        const weekAgo = new Date(Date.now() - 7 * DAY);

        const [
            submissions,
            applications,
            reports,
            reportsByInstructors,
            failedPayouts,
            nextRun,
        ] = await Promise.all([
            db.course.aggregate({
                where: { status: "IN_REVIEW" },
                _count: true,
                _min: { submittedAt: true },
            }),
            db.instructorApplication.aggregate({
                where: { status: "PENDING" },
                _count: true,
                _min: { createdAt: true },
            }),
            db.contentReport.count({
                where: { status: "OPEN", targetType: "REVIEW" },
            }),
            db.contentReport.count({
                where: {
                    status: "OPEN",
                    targetType: "REVIEW",
                    reporter: { role: "instructor" },
                },
            }),
            db.payout.count({ where: { status: "FAILED" } }),
            db.payoutRun.findFirst({
                where: {
                    status: "SCHEDULED",
                    scheduledFor: { gte: new Date() },
                },
                orderBy: { scheduledFor: "asc" },
                select: { scheduledFor: true },
            }),
        ]);

        const oldestApplication = applications._min.createdAt;

        return {
            coursesAwaitingReview: {
                count: submissions._count,
                oldestSubmittedAt: submissions._min.submittedAt,
            },
            instructorApplications: {
                count: applications._count,
                oldestCreatedAt: oldestApplication,
                allThisWeek:
                    applications._count > 0 &&
                    oldestApplication !== null &&
                    oldestApplication >= weekAgo,
            },
            reportedReviews: {
                count: reports,
                byInstructors: reportsByInstructors,
                byOthers: reports - reportsByInstructors,
            },
            failedPayouts: {
                count: failedPayouts,
                retryScheduledFor: nextRun?.scheduledFor ?? null,
            },
        };
    },
);

export async function getTopCourses(limit = 5): Promise<TopCourse[]> {
    const rows = await db.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { enrollmentCount: "desc" },
        take: limit,
        select: {
            slug: true,
            title: true,
            rating: true,
            enrollmentCount: true,
            category: { select: { name: true, slug: true, accentColor: true } },
        },
    });

    return rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        categoryName: row.category.name,
        categorySlug: row.category.slug,
        categoryAccent: row.category.accentColor,
        rating: row.rating,
        enrollmentCount: row.enrollmentCount,
    }));
}
