import { getSession } from "@/lib/auth";
import {
    STUDENTS_PAGE_SIZE,
    studentsCopy,
    studentTabValues,
    type StudentStatus,
    type StudentTab,
} from "@/lib/config/instructor-students";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { longAgoPrecise } from "@/lib/relative-time";
import { initialsOf } from "@/lib/user";
import type { Prisma } from "@/generated/prisma/client";

export type StudentsQuery = {
    tab: StudentTab;
    courseId: string | null;
    query: string;
};

export type StudentCourse = { id: string; title: string };

export type StudentRow = {
    id: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    initials: string;
    courseId: string;
    courseTitle: string;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    quiz: { passed: number; total: number } | null;
    status: StudentStatus;
    lastActive: string;
};

export type StudentsPage = {
    rows: StudentRow[];
    courses: StudentCourse[];
    total: number;
    page: number;
    pageCount: number;
    query: StudentsQuery;
    stats: {
        total: number;
        activeThisWeek: number;
        completionRate: number | null;
        rating: number | null;
    };
    generatedAt: Date;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function parseStudentsQuery(params: {
    tab?: string | string[];
    course?: string | string[];
    q?: string | string[];
    page?: string | string[];
}): StudentsQuery & { page: number } {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawTab = one(params.tab);
    const rawCourse = (one(params.course) ?? "").trim();
    const rawPage = Number(one(params.page));

    return {
        tab:
            rawTab && studentTabValues.has(rawTab)
                ? (rawTab as StudentTab)
                : "all",
        courseId: rawCourse === "" ? null : rawCourse.slice(0, 64),
        query: (one(params.q) ?? "").trim().slice(0, 100),
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

function rowsWhere(
    instructorId: string,
    query: StudentsQuery,
): Prisma.EnrollmentWhereInput {
    return {
        course: {
            instructorId,
            ...(query.courseId ? { id: query.courseId } : {}),
        },
        ...(query.tab === "completed" ? { completedAt: { not: null } } : {}),
        ...(query.tab === "active" ? { completedAt: null } : {}),
        ...(query.query
            ? {
                  user: {
                      OR: [
                          {
                              name: {
                                  contains: query.query,
                                  mode: "insensitive" as const,
                              },
                          },
                          {
                              email: {
                                  contains: query.query,
                                  mode: "insensitive" as const,
                              },
                          },
                      ],
                  },
              }
            : {}),
    };
}

export async function getStudentsPage(
    query: StudentsQuery & { page: number },
): Promise<StudentsPage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const now = new Date();
    const mine = { instructorId: profile.id };
    const where = rowsWhere(profile.id, query);

    const [total, courses, enrolmentTotal, activeThisWeek, completed, rated] =
        await Promise.all([
            db.enrollment.count({ where }),
            db.course.findMany({
                where: mine,
                orderBy: { title: "asc" },
                select: { id: true, title: true },
            }),
            db.enrollment.count({ where: { course: mine } }),
            db.enrollment.count({
                where: {
                    course: mine,
                    lastAccessedAt: { gte: new Date(now.getTime() - WEEK_MS) },
                },
            }),
            db.enrollment.count({
                where: { course: mine, completedAt: { not: null } },
            }),
            db.course.findMany({
                where: {
                    ...mine,
                    status: "PUBLISHED",
                    reviewsCount: { gt: 0 },
                },
                select: { rating: true, reviewsCount: true },
            }),
        ]);

    const pageCount = Math.max(1, Math.ceil(total / STUDENTS_PAGE_SIZE));
    const page = Math.min(query.page, pageCount);

    const enrolments = await db.enrollment.findMany({
        where,
        orderBy: [
            { lastAccessedAt: { sort: "desc", nulls: "last" } },
            { id: "asc" },
        ],
        skip: (page - 1) * STUDENTS_PAGE_SIZE,
        take: STUDENTS_PAGE_SIZE,
        select: {
            id: true,
            userId: true,
            progressPercent: true,
            completedLessons: true,
            completedAt: true,
            lastAccessedAt: true,
            user: { select: { name: true, email: true, image: true } },
            course: { select: { id: true, title: true, lessonCount: true } },
        },
    });

    const courseIds = [...new Set(enrolments.map((row) => row.course.id))];
    const enrolmentIds = enrolments.map((row) => row.id);

    const [quizCounts, passedAttempts] = await Promise.all([
        db.courseLesson.groupBy({
            by: ["sectionId"],
            where: { section: { courseId: { in: courseIds } }, type: "QUIZ" },
            _count: { _all: true },
        }),
        db.quizAttempt.findMany({
            where: {
                enrollmentId: { in: enrolmentIds },
                submittedAt: { not: null },
            },
            select: { enrollmentId: true, quizId: true, passed: true },
        }),
    ]);

    const sectionCourse = new Map(
        (
            await db.courseSection.findMany({
                where: { courseId: { in: courseIds } },
                select: { id: true, courseId: true },
            })
        ).map((row) => [row.id, row.courseId]),
    );
    const quizzesByCourse = new Map<string, number>();
    for (const group of quizCounts) {
        const courseId = sectionCourse.get(group.sectionId);
        if (!courseId) continue;
        quizzesByCourse.set(
            courseId,
            (quizzesByCourse.get(courseId) ?? 0) + group._count._all,
        );
    }

    const submitted = new Map<string, Set<string>>();
    const passed = new Map<string, Set<string>>();
    for (const attempt of passedAttempts) {
        const seen = submitted.get(attempt.enrollmentId) ?? new Set<string>();
        seen.add(attempt.quizId);
        submitted.set(attempt.enrollmentId, seen);
        if (attempt.passed !== true) continue;
        const won = passed.get(attempt.enrollmentId) ?? new Set<string>();
        won.add(attempt.quizId);
        passed.set(attempt.enrollmentId, won);
    }

    const ratingTotal = rated.reduce((sum, row) => sum + row.reviewsCount, 0);

    return {
        rows: enrolments.map((row) => {
            const name = row.user.name?.trim() || row.user.email;
            const quizTotal = quizzesByCourse.get(row.course.id) ?? 0;
            const hasSubmitted = (submitted.get(row.id)?.size ?? 0) > 0;

            return {
                id: row.id,
                userId: row.userId,
                name,
                email: row.user.email,
                image: row.user.image,
                initials: initialsOf(name, row.user.email),
                courseId: row.course.id,
                courseTitle: row.course.title,
                progressPercent: row.progressPercent,
                completedLessons: row.completedLessons,
                totalLessons: row.course.lessonCount,
                quiz:
                    quizTotal === 0 || !hasSubmitted
                        ? null
                        : {
                              passed: passed.get(row.id)?.size ?? 0,
                              total: quizTotal,
                          },
                status: row.completedAt === null ? "active" : "completed",
                lastActive: row.lastAccessedAt
                    ? longAgoPrecise(row.lastAccessedAt, now)
                    : studentsCopy.neverActive,
            };
        }),
        courses,
        total,
        page,
        pageCount,
        query: { tab: query.tab, courseId: query.courseId, query: query.query },
        stats: {
            total: enrolmentTotal,
            activeThisWeek,
            completionRate:
                enrolmentTotal === 0
                    ? null
                    : Math.round((completed / enrolmentTotal) * 100),
            rating:
                ratingTotal === 0
                    ? null
                    : Math.round(
                          (rated.reduce(
                              (sum, row) => sum + row.rating * row.reviewsCount,
                              0,
                          ) /
                              ratingTotal) *
                              10,
                      ) / 10,
        },
        generatedAt: now,
    };
}

export async function getAllStudents(
    query: StudentsQuery,
    limit: number,
): Promise<StudentRow[] | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const now = new Date();
    const rows = await db.enrollment.findMany({
        where: rowsWhere(profile.id, query),
        orderBy: [
            { lastAccessedAt: { sort: "desc", nulls: "last" } },
            { id: "asc" },
        ],
        take: limit,
        select: {
            id: true,
            userId: true,
            progressPercent: true,
            completedLessons: true,
            completedAt: true,
            lastAccessedAt: true,
            user: { select: { name: true, email: true, image: true } },
            course: { select: { id: true, title: true, lessonCount: true } },
        },
    });

    return rows.map((row) => {
        const name = row.user.name?.trim() || row.user.email;
        return {
            id: row.id,
            userId: row.userId,
            name,
            email: row.user.email,
            image: row.user.image,
            initials: initialsOf(name, row.user.email),
            courseId: row.course.id,
            courseTitle: row.course.title,
            progressPercent: row.progressPercent,
            completedLessons: row.completedLessons,
            totalLessons: row.course.lessonCount,
            quiz: null,
            status: row.completedAt === null ? "active" : "completed",
            lastActive: row.lastAccessedAt
                ? longAgoPrecise(row.lastAccessedAt, now)
                : studentsCopy.neverActive,
        };
    });
}
