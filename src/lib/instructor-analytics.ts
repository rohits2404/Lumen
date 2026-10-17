import { getSession } from "@/lib/auth";
import {
    ANALYTICS_COURSE_LIMIT,
    ANALYTICS_DEFAULT_RANGE,
    analyticsRangeValues,
    ENROLMENT_MONTHS,
    enrolmentSources,
    rangeDays,
    type AnalyticsRange,
} from "@/lib/config/instructor-analytics";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import type { EnrollmentSource, Prisma } from "@/generated/prisma/client";

export type AnalyticsStat = {
    value: number | null;
    delta: number | null;
};

export type AnalyticsStats = {
    enrolments: AnalyticsStat;
    openQuestions: AnalyticsStat;
    completion: AnalyticsStat;
    watchTime: AnalyticsStat;
    perDay: number;
};

export type EnrolmentMonth = {
    month: Date;
    count: number;
};

export type EnrolmentSeries = {
    months: EnrolmentMonth[];
    total: number;
    bestMonth: string | null;
    delta: number | null;
};

export type SourceRow = {
    source: EnrollmentSource;
    count: number;
    percent: number;
};

export type CoursePerformanceRow = {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
    enrolments: number;
    completion: number | null;
    watchTime: number | null;
};

export type AnalyticsPage = {
    range: AnalyticsRange;
    stats: AnalyticsStats;
    series: EnrolmentSeries;
    sources: SourceRow[];
    courses: CoursePerformanceRow[];
    hasCourses: boolean;
    generatedAt: Date;
};

const DAY = 24 * 60 * 60 * 1000;

const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
});

export function parseAnalyticsQuery(params: {
    range?: string | string[];
}): AnalyticsRange {
    const raw = Array.isArray(params.range) ? params.range[0] : params.range;
    return raw && analyticsRangeValues.has(raw)
        ? (raw as AnalyticsRange)
        : ANALYTICS_DEFAULT_RANGE;
}

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

export async function getAnalyticsPage(
    range: AnalyticsRange,
): Promise<AnalyticsPage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const now = new Date();
    const days = rangeDays(range);
    const from = new Date(now.getTime() - days * DAY);
    const before = new Date(now.getTime() - 2 * days * DAY);

    const mine: Prisma.EnrollmentWhereInput = {
        course: { instructorId: profile.id },
    };
    const window = { gte: from };
    const priorWindow = { gte: before, lt: from };

    const [
        courseCount,
        enrolments,
        priorEnrolments,
        openQuestions,
        openThisWindow,
        openPriorWindow,
        watch,
        priorWatch,
        activeCompleted,
        priorActiveCompleted,
    ] = await Promise.all([
        db.course.count({ where: { instructorId: profile.id } }),
        db.enrollment.count({ where: { ...mine, createdAt: window } }),
        db.enrollment.count({ where: { ...mine, createdAt: priorWindow } }),
        db.courseQuestion.count({
            where: {
                course: { instructorId: profile.id },
                deletedAt: null,
                answeredByInstructor: false,
            },
        }),
        db.courseQuestion.count({
            where: {
                course: { instructorId: profile.id },
                deletedAt: null,
                answeredByInstructor: false,
                createdAt: window,
            },
        }),
        db.courseQuestion.count({
            where: {
                course: { instructorId: profile.id },
                deletedAt: null,
                answeredByInstructor: false,
                createdAt: priorWindow,
            },
        }),
        db.enrollment.aggregate({
            where: { ...mine, lastAccessedAt: window },
            _avg: { progressPercent: true },
            _count: { _all: true },
        }),
        db.enrollment.aggregate({
            where: { ...mine, lastAccessedAt: priorWindow },
            _avg: { progressPercent: true },
            _count: { _all: true },
        }),
        db.enrollment.count({
            where: {
                ...mine,
                lastAccessedAt: window,
                completedAt: { not: null },
            },
        }),
        db.enrollment.count({
            where: {
                ...mine,
                lastAccessedAt: priorWindow,
                completedAt: { not: null },
            },
        }),
    ]);

    const seriesFrom = monthStart(ENROLMENT_MONTHS);
    const seriesUntil = monthStart(0);

    const [monthRows, sourceGroups, courseGroups] = await Promise.all([
        db.$queryRaw<{ month: Date; count: bigint | number }[]>`
      SELECT date_trunc('month', e."createdAt" AT TIME ZONE 'UTC') AS month,
             COUNT(*)::bigint AS count
      FROM "enrollment" e
      JOIN "course" c ON c.id = e."courseId"
      WHERE c."instructorId" = ${profile.id}
        AND e."createdAt" >= ${seriesFrom}
        AND e."createdAt" < ${seriesUntil}
      GROUP BY 1
      ORDER BY 1
    `,
        db.enrollment.groupBy({
            by: ["source"],
            where: { ...mine, createdAt: window },
            _count: { _all: true },
        }),
        db.enrollment.groupBy({
            by: ["courseId"],
            where: { ...mine, createdAt: window },
            _count: { _all: true },
        }),
    ]);

    const byMonth = new Map<number, number>();
    for (const row of monthRows) {
        const key = Date.UTC(row.month.getFullYear(), row.month.getMonth(), 1);
        byMonth.set(key, Number(row.count));
    }
    const months: EnrolmentMonth[] = Array.from(
        { length: ENROLMENT_MONTHS },
        (_, index) => {
            const month = monthStart(ENROLMENT_MONTHS - index);
            return { month, count: byMonth.get(month.getTime()) ?? 0 };
        },
    );
    const seriesTotal = months.reduce((sum, entry) => sum + entry.count, 0);
    const best = months.reduce<EnrolmentMonth | null>(
        (top, entry) => (top === null || entry.count > top.count ? entry : top),
        null,
    );

    const sourceTotal = sourceGroups.reduce(
        (sum, group) => sum + group._count._all,
        0,
    );
    const sources: SourceRow[] = enrolmentSources
        .flatMap((entry) => {
            const count =
                sourceGroups.find((group) => group.source === entry.value)
                    ?._count._all ?? 0;
            if (count === 0) return [];
            return [
                {
                    source: entry.value,
                    count,
                    percent: Math.round((count / sourceTotal) * 100),
                },
            ];
        })
        .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));

    const ranked = [...courseGroups]
        .sort(
            (a, b) =>
                b._count._all - a._count._all ||
                a.courseId.localeCompare(b.courseId),
        )
        .slice(0, ANALYTICS_COURSE_LIMIT);

    const rankedIds = ranked.map((group) => group.courseId);
    const [courseRows, healthGroups, completedGroups] =
        rankedIds.length === 0
            ? [[], [], []]
            : await Promise.all([
                  db.course.findMany({
                      where: { id: { in: rankedIds } },
                      select: {
                          id: true,
                          title: true,
                          thumbnailUrl: true,
                          category: {
                              select: { slug: true, accentColor: true },
                          },
                      },
                  }),
                  db.enrollment.groupBy({
                      by: ["courseId"],
                      where: { courseId: { in: rankedIds } },
                      _count: { _all: true },
                      _avg: { progressPercent: true },
                  }),
                  db.enrollment.groupBy({
                      by: ["courseId"],
                      where: {
                          courseId: { in: rankedIds },
                          completedAt: { not: null },
                      },
                      _count: { _all: true },
                  }),
              ]);

    const courseById = new Map(courseRows.map((row) => [row.id, row]));
    const healthById = new Map(healthGroups.map((row) => [row.courseId, row]));
    const completedById = new Map(
        completedGroups.map((row) => [row.courseId, row._count._all]),
    );

    const courses: CoursePerformanceRow[] = ranked.flatMap((group) => {
        const course = courseById.get(group.courseId);
        if (!course) return [];
        const health = healthById.get(group.courseId);
        const total = health?._count._all ?? 0;
        return [
            {
                id: course.id,
                title: course.title,
                thumbnailUrl: course.thumbnailUrl,
                categorySlug: course.category.slug,
                categoryAccent: course.category.accentColor,
                enrolments: group._count._all,
                completion:
                    total === 0
                        ? null
                        : (completedById.get(group.courseId) ?? 0) / total,
                watchTime:
                    total === 0
                        ? null
                        : (health?._avg.progressPercent ?? 0) / 100,
            },
        ];
    });

    const active = watch._count._all;
    const priorActive = priorWatch._count._all;

    const completionNow = active === 0 ? null : activeCompleted / active;
    const completionBefore =
        priorActive === 0 ? null : priorActiveCompleted / priorActive;
    const watchNow =
        active === 0 ? null : (watch._avg.progressPercent ?? 0) / 100;
    const watchBefore =
        priorActive === 0 ? null : (priorWatch._avg.progressPercent ?? 0) / 100;

    return {
        range,
        stats: {
            enrolments: {
                value: enrolments,
                delta: growth(enrolments, priorEnrolments),
            },
            openQuestions: {
                value: openQuestions,
                delta:
                    openThisWindow === 0 && openPriorWindow === 0
                        ? null
                        : openThisWindow - openPriorWindow,
            },
            completion: {
                value: completionNow,
                delta:
                    completionNow === null || completionBefore === null
                        ? null
                        : completionNow - completionBefore,
            },
            watchTime: {
                value: watchNow,
                delta:
                    watchNow === null || watchBefore === null
                        ? null
                        : watchNow - watchBefore,
            },
            perDay: enrolments / days,
        },
        series: {
            months,
            total: seriesTotal,
            bestMonth:
                best === null || best.count === 0
                    ? null
                    : monthName.format(best.month),
            delta: growth(months.at(-1)?.count ?? 0, months.at(-2)?.count ?? 0),
        },
        sources,
        courses,
        hasCourses: courseCount > 0,
        generatedAt: now,
    };
}
