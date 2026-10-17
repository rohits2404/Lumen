import { cache } from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { parseArticle, type ArticleDoc } from "@/lib/article-body";
import { couponSchedule } from "@/components/dashboard/instructor/coupons/coupons-format";
import type { EditorStepKey, LessonKind } from "@/lib/config/course-editor";
import type { CourseStatus } from "@/generated/prisma/client";
import type { QuizDraftQuestion } from "@/lib/quiz-draft";

export type EditorLesson = {
    id: string;
    title: string;
    kind: LessonKind;
    durationMinutes: number | null;
    questionsCount: number | null;
    isPreview: boolean;
    hasQuiz: boolean;
    video: EditorVideo | null;
    hasArticle: boolean;
};

export type EditorVideo = {
    url: string;
    fileName: string | null;
    sizeBytes: number;
    durationSeconds: number | null;
};

export type EditorSection = {
    id: string;
    title: string;
    lessons: EditorLesson[];
};

export type EditorLanding = {
    title: string;
    subtitle: string;
    description: string;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
};

export type EditorPricing = {
    currency: string;
    listPriceCents: number;
    includedInBusiness: boolean;
    promotions: EditorPromotion[];
};

export type EditorPromotion = {
    id: string;
    code: string;
    percentOff: number;
    schedule: string | null;
    redemptions: number;
};

export type EditorCourse = {
    id: string;
    slug: string;
    title: string;
    status: CourseStatus;
    learningOutcomes: string[];
    requirements: string[];
    intendedAudience: string;
    sections: EditorSection[];
    landing: EditorLanding;
    pricing: EditorPricing;
    messages: { welcomeMessage: string; congratulationsMessage: string };
    completed: Record<EditorStepKey, boolean>;
    totals: { lessons: number; sections: number };
};

export const getCourseForEditor = cache(async function getCourseForEditor(
    slug: string,
): Promise<EditorCourse | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const course = await db.course.findFirst({
        where: { slug, instructorId: profile.id },
        select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            status: true,
            description: true,
            learningOutcomes: true,
            requirements: true,
            intendedAudience: true,
            priceCents: true,
            thumbnailUrl: true,
            currency: true,
            listPriceCents: true,
            includedInBusiness: true,
            category: { select: { slug: true, accentColor: true } },
            welcomeMessage: true,
            congratulationsMessage: true,
            sections: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    title: true,
                    lessons: {
                        orderBy: { order: "asc" },
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            durationMinutes: true,
                            questionsCount: true,
                            isPreview: true,
                            videoAssetId: true,
                            articleBody: true,
                            quiz: { select: { id: true } },
                        },
                    },
                },
            },
            _count: { select: { coupons: true } },
        },
    });
    if (!course) return null;

    const assetIds = course.sections.flatMap((section) =>
        section.lessons.flatMap((lesson) =>
            lesson.videoAssetId ? [lesson.videoAssetId] : [],
        ),
    );
    const assets = assetIds.length
        ? await db.mediaAsset.findMany({
              where: { id: { in: assetIds }, ownerType: "LESSON_VIDEO" },
              select: {
                  id: true,
                  ownerId: true,
                  url: true,
                  title: true,
                  sizeBytes: true,
                  durationSeconds: true,
              },
          })
        : [];
    const videoFor = (lessonId: string, assetId: string | null) => {
        const asset = assets.find(
            (row) => row.id === assetId && row.ownerId === lessonId,
        );
        return asset
            ? {
                  url: asset.url,
                  fileName: asset.title,
                  sizeBytes: asset.sizeBytes,
                  durationSeconds: asset.durationSeconds,
              }
            : null;
    };

    const sections: EditorSection[] = course.sections.map((section) => ({
        id: section.id,
        title: section.title,
        lessons: section.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            kind: (lesson.type === "QUIZ"
                ? "QUIZ"
                : lesson.type === "VIDEO"
                  ? "VIDEO"
                  : "ARTICLE") as LessonKind,
            durationMinutes: lesson.durationMinutes,
            questionsCount: lesson.questionsCount,
            isPreview: lesson.isPreview,
            hasQuiz: lesson.quiz !== null,
            video: videoFor(lesson.id, lesson.videoAssetId),
            hasArticle: (lesson.articleBody ?? "").trim() !== "",
        })),
    }));

    const lessons = sections.reduce(
        (sum, section) => sum + section.lessons.length,
        0,
    );

    const now = new Date();
    const coupons = await activeCoupons(course.id, now);

    return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        status: course.status,
        learningOutcomes: course.learningOutcomes,
        requirements: course.requirements,
        intendedAudience: course.intendedAudience ?? "",
        sections,
        messages: {
            welcomeMessage: course.welcomeMessage ?? "",
            congratulationsMessage: course.congratulationsMessage ?? "",
        },
        landing: {
            title: course.title,
            subtitle: course.subtitle,
            description: course.description.join("\n\n"),
            thumbnailUrl: course.thumbnailUrl,
            categorySlug: course.category.slug,
            categoryAccent: course.category.accentColor,
        },
        pricing: {
            currency: course.currency,
            listPriceCents: course.listPriceCents,
            includedInBusiness: course.includedInBusiness,
            promotions: coupons.map((coupon) => ({
                id: coupon.id,
                code: coupon.code,
                percentOff: coupon.percentOff,
                schedule: couponSchedule(coupon.startsAt, coupon.endsAt, now),
                redemptions: coupon._count.redemptions,
            })),
        },
        completed: {
            "intended-learners": course.learningOutcomes.length > 0,
            curriculum: lessons > 0,
            "landing-page":
                course.subtitle.trim() !== "" && course.description.length > 0,
            pricing: course.priceCents > 0,
            coupons: course._count.coupons > 0,
            messages:
                (course.welcomeMessage ?? "").trim() !== "" ||
                (course.congratulationsMessage ?? "").trim() !== "",
        },
        totals: { lessons, sections: sections.length },
    };
});

async function activeCoupons(courseId: string, now: Date) {
    return db.coupon.findMany({
        where: {
            courseId,
            startsAt: { lte: now },
            OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        orderBy: { startsAt: "desc" },
        select: {
            id: true,
            code: true,
            percentOff: true,
            startsAt: true,
            endsAt: true,
            _count: { select: { redemptions: true } },
        },
    });
}

async function ownedLesson(slug: string, lessonId: string) {
    const course = await getCourseForEditor(slug);
    if (!course) return null;

    const lesson = await db.courseLesson.findFirst({
        where: { id: lessonId, section: { courseId: course.id } },
        select: {
            id: true,
            title: true,
            type: true,
            articleBody: true,
            section: { select: { title: true } },
        },
    });
    return lesson ? { course, lesson } : null;
}

export type ArticleEditorLesson = {
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    lessonId: string;
    title: string;
    sectionTitle: string;
    body: ArticleDoc | null;
};

export async function getArticleForEditor(
    slug: string,
    lessonId: string,
): Promise<ArticleEditorLesson | null> {
    const found = await ownedLesson(slug, lessonId);
    if (
        !found ||
        (found.lesson.type !== "ARTICLE" && found.lesson.type !== "PRACTICE")
    ) {
        return null;
    }

    return {
        courseId: found.course.id,
        courseSlug: found.course.slug,
        courseTitle: found.course.title,
        lessonId: found.lesson.id,
        title: found.lesson.title,
        sectionTitle: found.lesson.section.title,
        body: parseArticle(found.lesson.articleBody),
    };
}

export type QuizEditorLesson = {
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    lessonId: string;
    title: string;
    sectionTitle: string;
    questions: QuizDraftQuestion[];
};

export async function getQuizForEditor(
    slug: string,
    lessonId: string,
): Promise<QuizEditorLesson | null> {
    const found = await ownedLesson(slug, lessonId);
    if (!found || found.lesson.type !== "QUIZ") return null;

    const quiz = await db.quiz.findUnique({
        where: { lessonId: found.lesson.id },
        select: {
            questions: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    prompt: true,
                    options: {
                        orderBy: { order: "asc" },
                        select: { id: true, label: true, isCorrect: true },
                    },
                },
            },
        },
    });

    return {
        courseId: found.course.id,
        courseSlug: found.course.slug,
        courseTitle: found.course.title,
        lessonId: found.lesson.id,
        title: found.lesson.title,
        sectionTitle: found.lesson.section.title,
        questions: quiz?.questions ?? [],
    };
}
