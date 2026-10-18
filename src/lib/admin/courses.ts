import { cache } from "react";

import { db } from "@/lib/db";
import { COURSES_PAGE_SIZE } from "@/lib/config/admin-courses";
import type { CourseStatus, Prisma } from "@/generated/prisma/client";

export type CoursesTab =
    "all" | "in-review" | "needs-changes" | "published" | "rejected";

export type CoursesQuery = {
    tab: CoursesTab;
    page: number;
};

export type CourseRow = {
    id: string;
    slug: string;
    title: string;
    status: CourseStatus;
    instructorName: string;
    lessonCount: number;
    submittedAt: Date | null;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
};

export type CoursesPage = {
    rows: CourseRow[];
    total: number;
    page: number;
    pageCount: number;
    counts: Record<CoursesTab, number>;
    generatedAt: Date;
};

export type SubmissionCheck = {
    key: string;
    label: string;
    passed: boolean;
    automated: boolean;
};

export type CurriculumRow = {
    id: string;
    title: string;
    type: "VIDEO" | "ARTICLE" | "QUIZ" | "PRACTICE";
    durationMinutes: number | null;
    questionsCount: number | null;
};

export type CourseReview = {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    status: CourseStatus;
    instructorName: string;
    lessonCount: number;
    submittedAt: Date | null;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
    checks: SubmissionCheck[];
    curriculum: CurriculumRow[];
    lastDecision: {
        decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
        noteToInstructor: string | null;
        changeReasons: string[];
        reviewedAt: Date | null;
    } | null;
    generatedAt: Date;
};

const COURSES_TABS: CoursesTab[] = [
    "all",
    "in-review",
    "needs-changes",
    "published",
    "rejected",
];

export function parseCoursesQuery(params: {
    tab?: string | string[];
    page?: string | string[];
}): CoursesQuery {
    const first = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const tab = first(params.tab);
    const page = Number(first(params.page));

    return {
        tab: COURSES_TABS.includes(tab as CoursesTab)
            ? (tab as CoursesTab)
            : "all",
        page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
    };
}

const TAB_STATUS: Record<Exclude<CoursesTab, "all">, CourseStatus> = {
    "in-review": "IN_REVIEW",
    "needs-changes": "NEEDS_CHANGES",
    published: "PUBLISHED",
    rejected: "REJECTED",
};

function coursesWhere(tab: CoursesTab): Prisma.CourseWhereInput {
    if (tab === "all") return { status: { not: "DRAFT" } };
    return { status: TAB_STATUS[tab] };
}

const ROW_SELECT = {
    id: true,
    slug: true,
    title: true,
    status: true,
    lessonCount: true,
    submittedAt: true,
    thumbnailUrl: true,
    instructor: { select: { name: true } },
    category: { select: { slug: true, accentColor: true } },
} satisfies Prisma.CourseSelect;

function toRow(row: {
    instructor: { name: string };
    category: { slug: string; accentColor: string };
    [key: string]: unknown;
}): CourseRow {
    const { instructor, category, ...rest } = row;
    return {
        ...(rest as Omit<
            CourseRow,
            "instructorName" | "categorySlug" | "categoryAccent"
        >),
        instructorName: instructor.name,
        categorySlug: category.slug,
        categoryAccent: category.accentColor,
    };
}

export const getCoursesPage = cache(async function getCoursesPage(
    input: CoursesQuery,
): Promise<CoursesPage> {
    const where = coursesWhere(input.tab);

    const [total, grouped, rows] = await Promise.all([
        db.course.count({ where }),
        db.course.groupBy({
            by: ["status"],
            where: { status: { not: "DRAFT" } },
            _count: { _all: true },
        }),
        db.course.findMany({
            where,
            orderBy: { submittedAt: { sort: "desc", nulls: "last" } },
            skip: (input.page - 1) * COURSES_PAGE_SIZE,
            take: COURSES_PAGE_SIZE,
            select: ROW_SELECT,
        }),
    ]);

    const byStatus = new Map(
        grouped.map((entry) => [entry.status, entry._count._all]),
    );

    return {
        rows: rows.map(toRow),
        total,
        page: input.page,
        pageCount: Math.max(1, Math.ceil(total / COURSES_PAGE_SIZE)),
        counts: {
            all: grouped.reduce((sum, entry) => sum + entry._count._all, 0),
            "in-review": byStatus.get("IN_REVIEW") ?? 0,
            "needs-changes": byStatus.get("NEEDS_CHANGES") ?? 0,
            published: byStatus.get("PUBLISHED") ?? 0,
            rejected: byStatus.get("REJECTED") ?? 0,
        },
        generatedAt: new Date(),
    };
});

const CURRICULUM_PREVIEW_LIMIT = 5;

export const getCourseReview = cache(async function getCourseReview(
    slug: string,
): Promise<CourseReview | null> {
    const course = await db.course.findUnique({
        where: { slug },
        select: {
            ...ROW_SELECT,
            subtitle: true,
            submissions: {
                orderBy: { submittedAt: "desc" },
                take: 1,
                select: {
                    decision: true,
                    reviewedAt: true,
                    changeReasons: true,
                    noteToInstructor: true,
                    checks: {
                        select: {
                            key: true,
                            label: true,
                            passed: true,
                            automated: true,
                        },
                    },
                },
            },
            sections: {
                orderBy: { order: "asc" },
                select: {
                    order: true,
                    lessons: {
                        orderBy: { order: "asc" },
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            durationMinutes: true,
                            questionsCount: true,
                        },
                    },
                },
            },
        },
    });

    if (!course || course.status === "DRAFT") return null;

    const { submissions, sections, subtitle, ...rest } = course;
    const submission = submissions[0] ?? null;

    const curriculum: CurriculumRow[] = sections
        .flatMap((section) => section.lessons)
        .slice(0, CURRICULUM_PREVIEW_LIMIT)
        .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            durationMinutes: lesson.durationMinutes,
            questionsCount: lesson.questionsCount,
        }));

    return {
        ...toRow(rest),
        subtitle,
        curriculum,
        checks: (submission?.checks ?? []).slice().sort((a, b) => {
            const order =
                CHECK_ORDER.indexOf(a.key) - CHECK_ORDER.indexOf(b.key);
            return order !== 0 ? order : a.key.localeCompare(b.key);
        }),
        lastDecision: submission?.decision
            ? {
                  decision: submission.decision,
                  noteToInstructor: submission.noteToInstructor,
                  changeReasons: submission.changeReasons,
                  reviewedAt: submission.reviewedAt,
              }
            : null,
        generatedAt: new Date(),
    };
});

const CHECK_ORDER = [
    "min_lessons_and_video",
    "audio_quality",
    "cover_resolution",
    "closes_with_quiz",
];
