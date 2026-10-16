import { cache } from "react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    categoryGradients,
    FALLBACK_CATEGORY_GRADIENT,
} from "@/lib/config/admin-overview";
import type {
    CourseLevel,
    BrowseCourseCategory,
} from "@/lib/config/browse-courses";
import type {
    CourseLesson,
    CourseReview,
    CourseSection,
} from "@/lib/config/course-details";
import {
    buildEncouragement,
    buildQuizzes,
    buildSections,
    buildSuitFor,
    type CoursePlayerCourse,
    type CourseQuestion,
    type CourseQuiz,
    type QuestionReply,
} from "@/lib/config/course-player";
import { parseArticle, type ArticleDoc } from "@/lib/article-body";
import { canAccessCourseContent } from "@/lib/course-access";
import { compactAgo, longAgo } from "@/lib/relative-time";
import type { CourseLevel as DbCourseLevel } from "@/generated/prisma/client";

const REVIEW_LIMIT = 8;
const QUESTION_LIMIT = 8;
const REPLY_LIMIT = 12;

export const getEnrolledCourse = cache(async function getEnrolledCourse(
    slug: string,
): Promise<CoursePlayerCourse | null> {
    return buildFromDatabase(slug);
});

export const getEnrolledCourseQuiz = cache(async function getEnrolledCourseQuiz(
    courseSlug: string,
    quizSlug: string,
) {
    const course = await getEnrolledCourse(courseSlug);
    const quiz = course?.quizzes.find((entry) => entry.slug === quizSlug);
    return course && quiz ? { course, quiz } : null;
});

async function buildFromDatabase(
    slug: string,
): Promise<CoursePlayerCourse | null> {
    const course = await db.course.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            description: true,
            level: true,
            rating: true,
            reviewsCount: true,
            intendedAudience: true,
            category: { select: { name: true, accentColor: true } },
            instructor: {
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    title: true,
                    imageUrl: true,
                    userId: true,
                    user: { select: { image: true } },
                },
            },
            sections: {
                orderBy: { order: "asc" },
                select: {
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
                            quiz: {
                                select: {
                                    questions: {
                                        orderBy: { order: "asc" },
                                        select: {
                                            prompt: true,
                                            options: {
                                                orderBy: { order: "asc" },
                                                select: {
                                                    label: true,
                                                    isCorrect: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!course) return null;

    const session = await getSession();
    const now = new Date();

    const enrollment = session
        ? await db.enrollment.findUnique({
              where: {
                  userId_courseId: {
                      userId: session.user.id,
                      courseId: course.id,
                  },
              },
              select: { id: true, progressPercent: true },
          })
        : null;

    const [completedLessons, reviews, questions] = await Promise.all([
        enrollment
            ? db.lessonProgress.count({
                  where: {
                      enrollmentId: enrollment.id,
                      completedAt: { not: null },
                  },
              })
            : Promise.resolve(0),
        db.courseReview.findMany({
            where: { courseId: course.id, status: "VISIBLE", deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: REVIEW_LIMIT,
            select: {
                id: true,
                rating: true,
                body: true,
                createdAt: true,
                user: { select: { name: true, image: true } },
            },
        }),
        db.courseQuestion.findMany({
            where: { courseId: course.id },
            orderBy: { createdAt: "desc" },
            take: QUESTION_LIMIT,
            select: {
                id: true,
                title: true,
                createdAt: true,
                answeredByInstructor: true,
                lessonId: true,
                author: { select: { name: true, image: true } },
                replies: {
                    orderBy: { createdAt: "asc" },
                    take: REPLY_LIMIT,
                    select: {
                        id: true,
                        body: true,
                        createdAt: true,
                        authorId: true,
                        author: { select: { name: true, image: true } },
                    },
                },
            },
        }),
    ]);

    const sections: CourseSection[] = course.sections.map((section) => {
        const minutes = section.lessons.reduce(
            (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
            0,
        );
        return {
            title: section.title,
            lessonsLabel: `${section.lessons.length} ${section.lessons.length === 1 ? "lesson" : "lessons"}`,
            durationLabel: formatDuration(minutes),
            lessons: section.lessons.map(toConfigLesson),
        };
    });

    const progress = enrollment?.progressPercent ?? 0;
    const access = (await canAccessCourseContent(course.id))
        ? "full"
        : "preview";

    const dbLessons = course.sections.flatMap((section) => section.lessons);
    let rowIndex = 0;
    const playerSections = buildSections(sections, completedLessons).map(
        (section) => ({
            ...section,
            lessons: section.lessons.map((row) => {
                const lesson = dbLessons[rowIndex++];
                if (!lesson) return row;
                return {
                    ...row,
                    id: lesson.id,
                    type:
                        lesson.type === "QUIZ"
                            ? ("quiz" as const)
                            : lesson.type === "VIDEO"
                              ? ("video" as const)
                              : ("article" as const),
                    preview: lesson.isPreview,
                    locked: access === "preview" && !lesson.isPreview,
                };
            }),
        }),
    );

    const lessonTags = new Map<string, string>();
    let lessonNumber = 0;
    for (const section of course.sections) {
        for (const lesson of section.lessons) {
            lessonNumber += 1;
            lessonTags.set(
                lesson.id,
                `Lesson ${lessonNumber} · ${lesson.title}`,
            );
        }
    }

    const instructorUserId = course.instructor.userId;
    const instructorAvatar =
        course.instructor.imageUrl ??
        course.instructor.user?.image ??
        undefined;

    return {
        slug: course.slug,
        access,
        published: course.status === "PUBLISHED",
        title: course.title,
        art:
            categoryGradients[course.category.accentColor] ??
            FALLBACK_CATEGORY_GRADIENT,
        instructor: {
            name: course.instructor.name,
            title: course.instructor.title,
            avatarUrl: instructorAvatar,
            slug: course.instructor.slug,
        },
        progress,
        encouragement: buildEncouragement(course.title, progress),
        sections: playerSections,
        quizzes: withAuthoredQuestions(
            buildQuizzes(sections),
            course.sections.flatMap((section) =>
                section.lessons.filter((lesson) => lesson.type === "QUIZ"),
            ),
        ),
        about: {
            description: course.description,
            suitFor: course.intendedAudience
                ? [course.intendedAudience]
                : buildSuitFor({
                      title: course.title,
                      level: toDisplayLevel(course.level),
                      category: course.category.name as BrowseCourseCategory,
                  }),
        },
        questions: questions.map<CourseQuestion>((question) => ({
            id: question.id,
            title: question.title,
            name: question.author.name,
            avatarUrl: question.author.image ?? undefined,
            timeAgo: compactAgo(question.createdAt, now),
            lessonTag:
                (question.lessonId
                    ? lessonTags.get(question.lessonId)
                    : undefined) ?? "This course",
            answered: question.answeredByInstructor,
            replies: question.replies.map<QuestionReply>((reply) => ({
                name: reply.author.name,
                role:
                    instructorUserId && reply.authorId === instructorUserId
                        ? "Instructor"
                        : "Student",
                avatarUrl: reply.author.image ?? undefined,
                timeAgo: compactAgo(reply.createdAt, now),
                body: reply.body,
            })),
        })),
        rating: course.rating,
        reviewsCount: course.reviewsCount,
        reviews: reviews.map<CourseReview>((review) => ({
            name: review.user.name,
            avatarUrl: review.user.image ?? undefined,
            rating: review.rating,
            timeAgo: longAgo(review.createdAt, now),
            body: review.body,
        })),
        notes: [],
    };
}

function withAuthoredQuestions(
    quizzes: CourseQuiz[],
    lessons: {
        quiz: {
            questions: {
                prompt: string;
                options: { label: string; isCorrect: boolean }[];
            }[];
        } | null;
    }[],
): CourseQuiz[] {
    return quizzes.map((quiz, index) => {
        const authored = lessons[index]?.quiz?.questions ?? [];
        if (authored.length === 0) return quiz;
        return {
            ...quiz,
            questions: authored.map((question) => ({
                prompt: question.prompt,
                options: question.options.map((option) => option.label),
                answerIndex: Math.max(
                    0,
                    question.options.findIndex((option) => option.isCorrect),
                ),
            })),
        };
    });
}

function toConfigLesson(lesson: {
    title: string;
    type: "VIDEO" | "ARTICLE" | "QUIZ" | "PRACTICE";
    durationMinutes: number | null;
    questionsCount: number | null;
}): CourseLesson {
    if (lesson.type === "QUIZ") {
        return {
            title: lesson.title,
            type: "quiz",
            questions: lesson.questionsCount ?? 5,
        };
    }
    return {
        title: lesson.title,
        type:
            lesson.type === "ARTICLE"
                ? "article"
                : lesson.type === "PRACTICE"
                  ? "practice"
                  : "video",
        minutes: lesson.durationMinutes ?? 0,
    };
}

function toDisplayLevel(level: DbCourseLevel): CourseLevel {
    switch (level) {
        case "BEGINNER":
            return "Beginner";
        case "INTERMEDIATE":
            return "Intermediate";
        case "ADVANCED":
            return "Advanced";
        default:
            return "All Levels";
    }
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export type LessonView = {
    id: string;
    title: string;
    sectionTitle: string;
    number: number;
    total: number;
    previousId: string | null;
    nextId: string | null;
    completed: boolean;
} & (
    | {
          kind: "video";
          video: { url: string; durationSeconds: number | null } | null;
      }
    | { kind: "article"; minutes: number | null; body: ArticleDoc | null }
    | { kind: "quiz"; questions: number; quizSlug: string | null }
    | { kind: "locked"; lessonKind: "video" | "article" | "quiz" }
);

export async function getLessonView(
    course: CoursePlayerCourse,
    requestedId: string | undefined,
): Promise<LessonView | null> {
    if (!course.access) return null;

    const rows = course.sections.flatMap((section) =>
        section.lessons.map((lesson) => ({
            lesson,
            sectionTitle: section.title,
        })),
    );
    const withIds = rows.filter((row) => row.lesson.id);
    if (withIds.length === 0) return null;

    const index = Math.max(
        0,
        withIds.findIndex((row) => row.lesson.id === requestedId) !== -1
            ? withIds.findIndex((row) => row.lesson.id === requestedId)
            : withIds.findIndex((row) => row.lesson.state === "current"),
    );
    const { lesson: row, sectionTitle } = withIds[index]!;

    const session = await getSession();
    const progress = session
        ? await db.lessonProgress.findFirst({
              where: {
                  lessonId: row.id!,
                  enrollment: { userId: session.user.id },
                  NOT: { completedAt: null },
              },
              select: { id: true },
          })
        : null;

    const base = {
        id: row.id!,
        title: row.title,
        sectionTitle,
        number: index + 1,
        total: withIds.length,
        previousId: withIds[index - 1]?.lesson.id ?? null,
        nextId: withIds[index + 1]?.lesson.id ?? null,
        completed: progress !== null,
    };

    if (row.locked) return { ...base, kind: "locked", lessonKind: row.type };

    const lesson = await db.courseLesson.findFirst({
        where: { id: row.id, section: { course: { slug: course.slug } } },
        select: {
            type: true,
            title: true,
            durationMinutes: true,
            questionsCount: true,
            articleBody: true,
            videoAssetId: true,
        },
    });
    if (!lesson) return null;

    if (lesson.type === "QUIZ") {
        return {
            ...base,
            title: lesson.title,
            kind: "quiz",
            questions: lesson.questionsCount ?? 0,
            quizSlug: row.quizSlug ?? null,
        };
    }

    if (lesson.type === "VIDEO") {
        const asset = lesson.videoAssetId
            ? await db.mediaAsset.findFirst({
                  where: {
                      id: lesson.videoAssetId,
                      ownerId: row.id,
                      ownerType: "LESSON_VIDEO",
                  },
                  select: { url: true, durationSeconds: true },
              })
            : null;
        return {
            ...base,
            title: lesson.title,
            kind: "video",
            video: asset
                ? { url: asset.url, durationSeconds: asset.durationSeconds }
                : null,
        };
    }

    return {
        ...base,
        title: lesson.title,
        kind: "article",
        minutes: lesson.durationMinutes,
        body: parseArticle(lesson.articleBody),
    };
}
