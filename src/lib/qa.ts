import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { compactAgo } from "@/lib/relative-time";
import { initialsOf } from "@/lib/user";
import {
    QA_THREAD_REPLY_LIMIT,
    QUESTIONS_PAGE_SIZE,
    qaTabValues,
    type QaTab,
} from "@/lib/config/qa";
import type { Prisma } from "@/generated/prisma/client";

export type QaQuery = {
    tab: QaTab;
    courseId: string | null;
    page: number;
};

export type QaCourse = { id: string; title: string };

export type QaPerson = {
    name: string;
    image: string | null;
    initials: string;
    role: string;
};

export type QuestionRow = {
    id: string;
    title: string;
    body: string;
    courseTitle: string;
    lessonLabel: string | null;
    voteCount: number;
    voted: boolean;
    replyCount: number;
    answered: boolean;
    age: string;
    author: QaPerson;
};

export type QuestionsPage = {
    rows: QuestionRow[];
    courses: QaCourse[];
    total: number;
    page: number;
    pageCount: number;
    query: QaQuery;
};

export function parseQuestionsQuery(params: {
    tab?: string | string[];
    course?: string | string[];
    page?: string | string[];
}): QaQuery {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawTab = one(params.tab);
    const rawCourse = (one(params.course) ?? "").trim();
    const rawPage = Number(one(params.page));

    return {
        tab: rawTab && qaTabValues.has(rawTab) ? (rawTab as QaTab) : "all",
        courseId: rawCourse === "" ? null : rawCourse.slice(0, 64),
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

const person = (author: {
    name: string;
    email: string;
    image: string | null;
    role: string | null;
}): QaPerson => ({
    name: author.name,
    image: author.image,
    initials: initialsOf(author.name, author.email),
    role: author.role ?? "user",
});

function lessonLabel(
    lesson: { title: string; order: number } | null,
): string | null {
    return lesson ? `Lesson ${lesson.order + 1} · ${lesson.title}` : null;
}

export async function getQuestionsPage(
    query: QaQuery,
): Promise<QuestionsPage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const meId = session.user.id;
    const now = new Date();
    const mine: Prisma.CourseQuestionWhereInput = {
        deletedAt: null,
        course: { instructorId: profile.id },
    };
    const where: Prisma.CourseQuestionWhereInput = {
        ...mine,
        ...(query.tab === "answered" ? { answeredByInstructor: true } : {}),
        ...(query.tab === "unanswered" ? { answeredByInstructor: false } : {}),
        ...(query.courseId ? { courseId: query.courseId } : {}),
    };

    const [total, rows, courses] = await Promise.all([
        db.courseQuestion.count({ where }),
        db.courseQuestion.findMany({
            where,
            orderBy: [{ createdAt: "desc" }],
            skip: (Math.max(1, query.page) - 1) * QUESTIONS_PAGE_SIZE,
            take: QUESTIONS_PAGE_SIZE,
            select: {
                id: true,
                title: true,
                body: true,
                voteCount: true,
                replyCount: true,
                answeredByInstructor: true,
                createdAt: true,
                course: { select: { title: true } },
                lesson: { select: { title: true, order: true } },
                author: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                    },
                },
            },
        }),
        db.course.findMany({
            where: { instructorId: profile.id },
            orderBy: { title: "asc" },
            select: { id: true, title: true },
        }),
    ]);

    const ids = rows.map((row) => row.id);
    const votes = ids.length
        ? await db.courseQuestionVote.findMany({
              where: { userId: meId, questionId: { in: ids } },
              select: { questionId: true },
          })
        : [];
    const voted = new Set(votes.map((vote) => vote.questionId));

    const pageCount = Math.max(1, Math.ceil(total / QUESTIONS_PAGE_SIZE));

    return {
        rows: rows.map((row) => ({
            id: row.id,
            title: row.title,
            body: row.body,
            courseTitle: row.course.title,
            lessonLabel: lessonLabel(row.lesson),
            voteCount: row.voteCount,
            voted: voted.has(row.id),
            replyCount: row.replyCount,
            answered: row.answeredByInstructor,
            age: compactAgo(row.createdAt, now),
            author: person(row.author),
        })),
        courses,
        total,
        page: Math.min(Math.max(1, query.page), pageCount),
        pageCount,
        query,
    };
}

export type QaReplyRow = {
    id: string;
    body: string;
    age: string;
    fromStaff: boolean;
    author: QaPerson;
};

export type QuestionDetail = {
    id: string;
    title: string;
    paragraphs: string[];
    courseTitle: string;
    lessonLabel: string | null;
    voteCount: number;
    voted: boolean;
    replyCount: number;
    answered: boolean;
    age: string;
    author: QaPerson;
    replies: QaReplyRow[];
    me: { name: string; image: string | null; initials: string };
};

export async function getQuestionDetail(
    questionId: string,
): Promise<QuestionDetail | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const meId = session.user.id;
    const now = new Date();

    const row = await db.courseQuestion.findFirst({
        where: {
            id: questionId,
            deletedAt: null,
            course: { instructorId: profile.id },
        },
        select: {
            id: true,
            title: true,
            body: true,
            voteCount: true,
            replyCount: true,
            answeredByInstructor: true,
            createdAt: true,
            course: { select: { title: true } },
            lesson: { select: { title: true, order: true } },
            author: {
                select: { name: true, email: true, image: true, role: true },
            },
            replies: {
                where: { deletedAt: null },
                orderBy: { createdAt: "asc" },
                take: QA_THREAD_REPLY_LIMIT,
                select: {
                    id: true,
                    body: true,
                    createdAt: true,
                    author: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            role: true,
                        },
                    },
                },
            },
        },
    });
    if (!row) return null;

    const vote = await db.courseQuestionVote.findUnique({
        where: { questionId_userId: { questionId: row.id, userId: meId } },
        select: { id: true },
    });

    return {
        id: row.id,
        title: row.title,
        paragraphs: row.body
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean),
        courseTitle: row.course.title,
        lessonLabel: lessonLabel(row.lesson),
        voteCount: row.voteCount,
        voted: vote !== null,
        replyCount: row.replyCount,
        answered: row.answeredByInstructor,
        age: compactAgo(row.createdAt, now),
        author: person(row.author),
        replies: row.replies.map((reply) => ({
            id: reply.id,
            body: reply.body,
            age: compactAgo(reply.createdAt, now),
            fromStaff:
                reply.author.role === "instructor" ||
                reply.author.role === "admin",
            author: person(reply.author),
        })),
        me: {
            name: session.user.name,
            image: session.user.image ?? null,
            initials: initialsOf(session.user.name, session.user.email),
        },
    };
}

export async function getUnansweredQuestionCount(): Promise<number> {
    const session = await getSession();
    if (!session) return 0;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return 0;

    return db.courseQuestion.count({
        where: {
            deletedAt: null,
            answeredByInstructor: false,
            course: { instructorId: profile.id },
        },
    });
}
