import "server-only";

import { getSession } from "@/lib/auth";
import {
    categoryGradients,
    FALLBACK_CATEGORY_GRADIENT,
} from "@/lib/config/admin-overview";
import type {
    InstructorOverview,
    ProductionCourse,
    TopCourse,
} from "@/lib/config/instructor-overview";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";

const DAY = 24 * 60 * 60 * 1000;
const MONTHS = 6;

function emptyMonths(now: Date) {
    return Array.from({ length: MONTHS }, (_, index) => {
        const from = new Date(
            now.getFullYear(),
            now.getMonth() - (MONTHS - 1 - index),
            1,
        );
        return {
            month: from.toLocaleString("en-US", { month: "short" }),
            cents: 0,
        };
    });
}

const IN_PRODUCTION = ["DRAFT", "IN_REVIEW", "NEEDS_CHANGES"] as const;

export async function getInstructorOverview(): Promise<InstructorOverview | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const firstName =
        (profile.name ?? session.user.name).split(" ")[0] ?? "there";
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const courses = await db.course.findMany({
        where: { instructorId: profile.id },
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            rating: true,
            enrollmentCount: true,
            thumbnailUrl: true,
            category: { select: { name: true, slug: true, accentColor: true } },
            sections: {
                select: {
                    lessons: { select: { id: true, isPublished: true } },
                },
            },
        },
        orderBy: { enrollmentCount: "desc" },
    });

    const courseIds = courses.map((course) => course.id);

    if (courseIds.length === 0) {
        return {
            firstName,
            learnersThisMonth: 0,
            production: [],
            completion: {
                percent: 0,
                deltaPercent: 0,
                previousPercent: 0,
                enrolled: 0,
                completed: 0,
            },
            output: {
                watchPercent: 0,
                publishedLessonPercent: 0,
                completionPercent: 0,
                drafts: 0,
                published: 0,
            },
            spend: [],
            revenue: emptyMonths(now),
            revenueDeltaPercent: 0,
            topCourses: [],
        };
    }

    const [enrolments, learnersThisMonth, lessonTypes, earnings] =
        await Promise.all([
            db.enrollment.findMany({
                where: { courseId: { in: courseIds } },
                select: {
                    completedAt: true,
                    progressPercent: true,
                    createdAt: true,
                },
            }),
            db.enrollment.count({
                where: {
                    courseId: { in: courseIds },
                    createdAt: { gte: monthStart },
                },
            }),
            db.lessonProgress.findMany({
                where: {
                    NOT: { completedAt: null },
                    lesson: { section: { courseId: { in: courseIds } } },
                },
                select: { lesson: { select: { type: true } } },
            }),
            db.instructorEarning.findMany({
                where: {
                    instructorId: profile.id,
                    status: { not: "REVERSED" },
                    createdAt: { gte: new Date(now.getTime() - 400 * DAY) },
                },
                select: { netCents: true, createdAt: true },
            }),
        ]);

    const enrolled = enrolments.length;
    const completed = enrolments.filter(
        (row) => row.completedAt !== null,
    ).length;
    const percent = enrolled ? Math.round((completed / enrolled) * 100) : 0;

    const cutoff = new Date(now.getTime() - 30 * DAY);
    const older = enrolments.filter((row) => row.createdAt < cutoff);
    const previousPercent = older.length
        ? Math.round(
              (older.filter((row) => row.completedAt !== null).length /
                  older.length) *
                  100,
          )
        : 0;

    const allLessons = courses.flatMap((course) =>
        course.sections.flatMap((section) => section.lessons),
    );
    const publishedLessons = allLessons.filter((lesson) => lesson.isPublished);
    const watchPercent = enrolled
        ? Math.round(
              enrolments.reduce((sum, row) => sum + row.progressPercent, 0) /
                  enrolled,
          )
        : 0;

    const byType = { VIDEO: 0, ARTICLE: 0, QUIZ: 0 } as Record<string, number>;
    for (const row of lessonTypes) {
        byType[row.lesson.type] = (byType[row.lesson.type] ?? 0) + 1;
    }
    const spendTotal = lessonTypes.length;
    const spend = spendTotal
        ? [
              {
                  label: "Video",
                  value: +((byType.VIDEO / spendTotal) * 100).toFixed(1),
                  color: "var(--chart-1)" as const,
              },
              {
                  label: "Reading",
                  value: +((byType.ARTICLE / spendTotal) * 100).toFixed(1),
                  color: "var(--chart-2)" as const,
              },
              {
                  label: "Quizzes",
                  value: +((byType.QUIZ / spendTotal) * 100).toFixed(1),
                  color: "var(--chart-3)" as const,
              },
          ]
        : [];

    const revenue = Array.from({ length: MONTHS }, (_, index) => {
        const from = new Date(
            now.getFullYear(),
            now.getMonth() - (MONTHS - 1 - index),
            1,
        );
        const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
        const cents = earnings
            .filter((row) => row.createdAt >= from && row.createdAt < to)
            .reduce((sum, row) => sum + row.netCents, 0);
        return {
            month: from.toLocaleString("en-US", { month: "short" }),
            cents,
        };
    });
    const last = revenue.at(-1)?.cents ?? 0;
    const prior = revenue.at(-2)?.cents ?? 0;
    const revenueDeltaPercent = prior
        ? Math.round(((last - prior) / prior) * 1000) / 10
        : 0;

    const production: ProductionCourse[] = courses
        .filter((course) =>
            (IN_PRODUCTION as readonly string[]).includes(course.status),
        )
        .map((course) => {
            const lessons = course.sections.flatMap(
                (section) => section.lessons,
            );
            return {
                slug: course.slug,
                title: course.title,
                published: lessons.filter((lesson) => lesson.isPublished)
                    .length,
                total: lessons.length,
            };
        });

    const topCourses: TopCourse[] = courses
        .filter((course) => course.status === "PUBLISHED")
        .map((course) => ({
            slug: course.slug,
            title: course.title,
            categoryName: course.category.name,
            categorySlug: course.category.slug,
            art:
                categoryGradients[course.category.accentColor] ??
                FALLBACK_CATEGORY_GRADIENT,
            thumbnailUrl: course.thumbnailUrl,
            rating: course.rating,
            students: course.enrollmentCount,
        }));

    return {
        firstName,
        learnersThisMonth,
        production,
        completion: {
            percent,
            deltaPercent: percent - previousPercent,
            previousPercent,
            enrolled,
            completed,
        },
        output: {
            watchPercent,
            publishedLessonPercent: allLessons.length
                ? Math.round(
                      (publishedLessons.length / allLessons.length) * 100,
                  )
                : 0,
            completionPercent: percent,
            drafts: courses.filter((course) => course.status !== "PUBLISHED")
                .length,
            published: courses.filter((course) => course.status === "PUBLISHED")
                .length,
        },
        spend,
        revenue,
        revenueDeltaPercent,
        topCourses,
    };
}
