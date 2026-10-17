import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import {
    COURSES_PAGE_SIZE,
    myCoursesTabValues,
    tabStatuses,
} from "@/lib/config/instructor-courses";
import type { CourseStatus, Prisma } from "@/generated/prisma/client";

export type MyCoursesTab = "all" | "published" | "drafts" | "in-review";

export type InstructorCoursesQuery = {
    tab: MyCoursesTab;
    query: string;
    page: number;
};

export type MyCourseRow = {
    id: string;
    slug: string;
    title: string;
    status: CourseStatus;
    categorySlug: string;
    categoryAccent: string;
    thumbnailUrl: string | null;
    lessonCount: number;
    students: number | null;
    rating: number | null;
    revenueCents: number | null;
    builtPercent: number | null;
    updated: string;
    updatedAt: Date;
};

export type InstructorCoursesPage = {
    rows: MyCourseRow[];
    total: number;
    page: number;
    pageCount: number;
    query: InstructorCoursesQuery;
    stats: {
        published: number;
        drafts: number;
        students: number;
        rating: number | null;
    };
};

export function parseInstructorCoursesQuery(params: {
    tab?: string | string[];
    q?: string | string[];
    page?: string | string[];
}): InstructorCoursesQuery {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawTab = one(params.tab);
    const rawPage = Number(one(params.page));

    return {
        tab:
            rawTab && myCoursesTabValues.has(rawTab)
                ? (rawTab as MyCoursesTab)
                : "all",
        query: (one(params.q) ?? "").trim().slice(0, 100),
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

export async function getInstructorCoursesPage(
    query: InstructorCoursesQuery,
): Promise<InstructorCoursesPage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const mine: Prisma.CourseWhereInput = { instructorId: profile.id };
    const statuses = tabStatuses[query.tab];
    const where: Prisma.CourseWhereInput = {
        ...mine,
        ...(statuses ? { status: { in: statuses } } : {}),
        ...(query.query
            ? {
                  OR: [
                      { title: { contains: query.query, mode: "insensitive" } },
                      {
                          subtitle: {
                              contains: query.query,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : {}),
    };

    const requested = Math.max(1, query.page);

    const rowQuery = {
        where,
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        take: COURSES_PAGE_SIZE,
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            thumbnailUrl: true,
            lessonCount: true,
            enrollmentCount: true,
            rating: true,
            reviewsCount: true,
            updatedAt: true,
            category: { select: { slug: true, accentColor: true } },
            sections: {
                select: { lessons: { select: { isPublished: true } } },
            },
        },
    } satisfies Prisma.CourseFindManyArgs;

    const [total, firstTry, headline] = await Promise.all([
        db.course.count({ where }),
        db.course.findMany({
            ...rowQuery,
            skip: (requested - 1) * COURSES_PAGE_SIZE,
        }),
        db.course.findMany({
            where: mine,
            select: {
                status: true,
                enrollmentCount: true,
                rating: true,
                reviewsCount: true,
            },
        }),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / COURSES_PAGE_SIZE));
    const page = Math.min(requested, pageCount);

    const rows =
        page === requested
            ? firstTry
            : await db.course.findMany({
                  ...rowQuery,
                  skip: (page - 1) * COURSES_PAGE_SIZE,
              });

    const liveIds = rows
        .filter(
            (row) => row.status === "PUBLISHED" || row.status === "ARCHIVED",
        )
        .map((row) => row.id);

    const earnings =
        liveIds.length === 0
            ? []
            : await db.instructorEarning.groupBy({
                  by: ["courseId"],
                  where: {
                      instructorId: profile.id,
                      courseId: { in: liveIds },
                      status: { not: "REVERSED" },
                  },
                  _sum: { netCents: true },
              });

    const netByCourse = new Map(
        earnings.map((row) => [row.courseId, row._sum.netCents ?? 0]),
    );

    const now = new Date();

    return {
        rows: rows.map((row) => {
            const live =
                row.status === "PUBLISHED" || row.status === "ARCHIVED";
            const lessons = row.sections.flatMap((section) => section.lessons);
            const published = lessons.filter(
                (lesson) => lesson.isPublished,
            ).length;

            return {
                id: row.id,
                slug: row.slug,
                title: row.title,
                status: row.status,
                categorySlug: row.category.slug,
                categoryAccent: row.category.accentColor,
                thumbnailUrl: row.thumbnailUrl,
                lessonCount: row.lessonCount,
                students:
                    live && row.enrollmentCount > 0
                        ? row.enrollmentCount
                        : null,
                rating: live && row.reviewsCount > 0 ? row.rating : null,
                revenueCents: live
                    ? (netByCourse.get(row.id) ?? 0) || null
                    : null,
                builtPercent: live
                    ? null
                    : lessons.length === 0
                      ? 0
                      : Math.round((published / lessons.length) * 100),
                updated: formatUpdatedAt(row.updatedAt, now),
                updatedAt: row.updatedAt,
            };
        }),
        total,
        page,
        pageCount,
        query: { ...query, page },
        stats: statsOf(headline),
    };
}

function statsOf(
    courses: {
        status: CourseStatus;
        enrollmentCount: number;
        rating: number;
        reviewsCount: number;
    }[],
): InstructorCoursesPage["stats"] {
    let published = 0;
    let drafts = 0;
    let students = 0;
    let ratingWeight = 0;
    let ratingTotal = 0;

    for (const course of courses) {
        if (course.status === "PUBLISHED") published += 1;
        if (course.status === "DRAFT" || course.status === "NEEDS_CHANGES") {
            drafts += 1;
        }
        if (course.status === "PUBLISHED" || course.status === "ARCHIVED") {
            students += course.enrollmentCount;
        }
        if (course.reviewsCount > 0) {
            ratingWeight += course.reviewsCount;
            ratingTotal += course.rating * course.reviewsCount;
        }
    }

    return {
        published,
        drafts,
        students,
        rating:
            ratingWeight === 0
                ? null
                : Math.round((ratingTotal / ratingWeight) * 10) / 10,
    };
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatUpdatedAt(date: Date, now: Date): string {
    const elapsed = Math.max(0, now.getTime() - date.getTime());
    if (elapsed < HOUR) {
        const minutes = Math.max(1, Math.floor(elapsed / MINUTE));
        return `Updated ${minutes} ${minutes === 1 ? "Minute" : "Minutes"} Ago`;
    }
    if (elapsed < DAY) {
        const hours = Math.floor(elapsed / HOUR);
        return `Updated ${hours} ${hours === 1 ? "Hour" : "Hours"} Ago`;
    }
    if (elapsed < 2 * DAY) return "Updated Yesterday";
    const days = Math.floor(elapsed / DAY);
    if (days < 7) return `Updated ${days} Days Ago`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `Updated ${weeks} ${weeks === 1 ? "Week" : "Weeks"} Ago`;
    }
    if (days < 365) {
        const months = Math.max(1, Math.floor(days / 30));
        return `Updated ${months} ${months === 1 ? "Month" : "Months"} Ago`;
    }
    const years = Math.floor(days / 365);
    return `Updated ${years} ${years === 1 ? "Year" : "Years"} Ago`;
}
