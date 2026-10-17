import { getSession } from "@/lib/auth";
import {
    RATING_BY_COURSE_LIMIT,
    RATING_TREND_DAYS,
    REVIEWS_PAGE_SIZE,
    reviewsTabValues,
    type ReviewsTab,
} from "@/lib/config/instructor-reviews";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { longAgo } from "@/lib/relative-time";
import { initialsOf } from "@/lib/user";
import type { Prisma } from "@/generated/prisma/client";

export type ReviewsQuery = {
    tab: ReviewsTab;
    courseId: string | null;
};

export type ReviewCourse = { id: string; title: string };

export type ReviewReply = {
    body: string;
    authorName: string;
    authorImage: string | null;
    authorInitials: string;
};

export type ReviewRow = {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    createdAgo: string;
    courseId: string;
    courseTitle: string;
    authorName: string;
    authorImage: string | null;
    authorInitials: string;
    reported: boolean;
    reply: ReviewReply | null;
};

export type RatingByCourseRow = {
    id: string;
    title: string;
    reviews: number;
    rating: number;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
};

export type ReviewsSummary = {
    rating: number | null;
    total: number;
    courses: number;
    breakdown: { stars: number; count: number; percent: number }[];
    trend: number | null;
};

export type ReviewsPage = {
    rows: ReviewRow[];
    courses: ReviewCourse[];
    byCourse: RatingByCourseRow[];
    summary: ReviewsSummary;
    total: number;
    page: number;
    pageCount: number;
    query: ReviewsQuery;
    generatedAt: Date;
};

const TAB_RATINGS: Record<Exclude<ReviewsTab, "all">, number[]> = {
    "5": [5],
    "4": [4],
    "3-below": [1, 2, 3],
};

export function parseReviewsQuery(params: {
    tab?: string | string[];
    course?: string | string[];
    page?: string | string[];
}): ReviewsQuery & { page: number } {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawTab = one(params.tab);
    const rawCourse = (one(params.course) ?? "").trim();
    const rawPage = Number(one(params.page));

    return {
        tab:
            rawTab && reviewsTabValues.has(rawTab)
                ? (rawTab as ReviewsTab)
                : "all",
        courseId: rawCourse === "" ? null : rawCourse.slice(0, 64),
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

function mineWhere(instructorId: string): Prisma.CourseReviewWhereInput {
    return {
        course: { instructorId },
        deletedAt: null,
        status: "VISIBLE",
    };
}

function rowsWhere(
    instructorId: string,
    query: ReviewsQuery,
): Prisma.CourseReviewWhereInput {
    const ratings = query.tab === "all" ? null : TAB_RATINGS[query.tab];
    return {
        ...mineWhere(instructorId),
        ...(query.courseId ? { courseId: query.courseId } : {}),
        ...(ratings ? { rating: { in: ratings } } : {}),
    };
}

export async function getReviewsPage(
    query: ReviewsQuery & { page: number },
): Promise<ReviewsPage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const now = new Date();
    const mine = mineWhere(profile.id);
    const where = rowsWhere(profile.id, query);
    const quarterAgo = new Date(
        now.getTime() - RATING_TREND_DAYS * 24 * 60 * 60 * 1000,
    );

    const [total, courses, overall, byRating, byCourse, before] =
        await Promise.all([
            db.courseReview.count({ where }),
            db.course.findMany({
                where: { instructorId: profile.id },
                orderBy: { title: "asc" },
                select: { id: true, title: true },
            }),
            db.courseReview.aggregate({
                where: mine,
                _avg: { rating: true },
                _count: { _all: true },
            }),
            db.courseReview.groupBy({
                by: ["rating"],
                where: mine,
                _count: { _all: true },
            }),
            db.courseReview.groupBy({
                by: ["courseId"],
                where: mine,
                _count: { _all: true },
                _avg: { rating: true },
            }),
            db.courseReview.aggregate({
                where: { ...mine, createdAt: { lt: quarterAgo } },
                _avg: { rating: true },
                _count: { _all: true },
            }),
        ]);

    const pageCount = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE));
    const page = Math.min(query.page, pageCount);

    const ranked = [...byCourse]
        .sort(
            (a, b) =>
                b._count._all - a._count._all ||
                a.courseId.localeCompare(b.courseId),
        )
        .slice(0, RATING_BY_COURSE_LIMIT);

    const [reviews, rankedCourses] = await Promise.all([
        db.courseReview.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (page - 1) * REVIEWS_PAGE_SIZE,
            take: REVIEWS_PAGE_SIZE,
            select: {
                id: true,
                rating: true,
                title: true,
                body: true,
                createdAt: true,
                course: { select: { id: true, title: true } },
                user: { select: { name: true, email: true, image: true } },
                reply: {
                    select: {
                        body: true,
                        author: {
                            select: { name: true, email: true, image: true },
                        },
                    },
                },
            },
        }),
        db.course.findMany({
            where: { id: { in: ranked.map((row) => row.courseId) } },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                category: { select: { slug: true, accentColor: true } },
            },
        }),
    ]);

    const reported = new Set(
        reviews.length === 0
            ? []
            : (
                  await db.contentReport.findMany({
                      where: {
                          targetType: "REVIEW",
                          targetId: { in: reviews.map((row) => row.id) },
                          status: "OPEN",
                      },
                      select: { targetId: true },
                  })
              ).map((row) => row.targetId),
    );

    const courseById = new Map(rankedCourses.map((row) => [row.id, row]));
    const counts = new Map(
        byRating.map((row) => [row.rating, row._count._all]),
    );
    const overallTotal = overall._count._all;

    return {
        rows: reviews.map((row) => {
            const name = row.user.name?.trim() || row.user.email;
            const replyAuthor = row.reply?.author;
            const replyName = replyAuthor
                ? replyAuthor.name?.trim() || replyAuthor.email
                : "";

            return {
                id: row.id,
                rating: row.rating,
                title: row.title,
                body: row.body,
                createdAgo: longAgo(row.createdAt, now),
                courseId: row.course.id,
                courseTitle: row.course.title,
                authorName: name,
                authorImage: row.user.image,
                authorInitials: initialsOf(name, row.user.email),
                reported: reported.has(row.id),
                reply: row.reply
                    ? {
                          body: row.reply.body,
                          authorName: replyName,
                          authorImage: replyAuthor?.image ?? null,
                          authorInitials: initialsOf(
                              replyName,
                              replyAuthor?.email ?? "",
                          ),
                      }
                    : null,
            };
        }),
        courses,
        byCourse: ranked.flatMap((group) => {
            const course = courseById.get(group.courseId);
            if (!course) return [];
            return [
                {
                    id: course.id,
                    title: course.title,
                    reviews: group._count._all,
                    rating: round1(group._avg.rating ?? 0),
                    thumbnailUrl: course.thumbnailUrl,
                    categorySlug: course.category.slug,
                    categoryAccent: course.category.accentColor,
                },
            ];
        }),
        summary: {
            rating:
                overallTotal === 0 ? null : round1(overall._avg.rating ?? 0),
            total: overallTotal,
            courses: byCourse.length,
            breakdown: [5, 4, 3, 2, 1].map((stars) => {
                const count = counts.get(stars) ?? 0;
                return {
                    stars,
                    count,
                    percent:
                        overallTotal === 0
                            ? 0
                            : Math.round((count / overallTotal) * 1000) / 10,
                };
            }),
            trend:
                overallTotal === 0 || before._count._all === 0
                    ? null
                    : round1(
                          (overall._avg.rating ?? 0) -
                              (before._avg.rating ?? 0),
                      ),
        },
        total,
        page,
        pageCount,
        query: { tab: query.tab, courseId: query.courseId },
        generatedAt: now,
    };
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}
