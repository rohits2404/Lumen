"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyCourseSubmitted } from "@/lib/notify";
import { canTeach, getInstructorProfile } from "@/lib/instructor";
import {
    articleWordCount,
    sanitizeArticle,
    type ArticleDoc,
} from "@/lib/article-body";
import {
    ARTICLE_MAX_CHARS,
    articleEditorCopy,
    COURSE_CURRENCIES,
    COURSE_MESSAGE_MAX,
    courseMessagesCopy,
    COVER_MAX_BYTES,
    COVER_MIME_TYPES,
    curriculumCopy,
    LANDING_LIMITS,
    landingPageCopy,
    PRICE_TIERS_CENTS,
    pricingCopy,
    LESSON_VIDEO_MAX_BYTES,
    LESSON_VIDEO_TYPES,
    lessonVideoCopy,
    quizEditorCopy,
    QUIZ_LIMITS,
    type LessonKind,
} from "@/lib/config/course-editor";
import type {
    EditorLesson,
    EditorSection,
    EditorVideo,
} from "@/lib/instructor-course-edit";
import { validateQuizDraft, type QuizDraftQuestion } from "@/lib/quiz-draft";
import {
    createLessonVideoUpload,
    deleteCourseCover,
    deleteLessonObject,
    putCourseCover,
    inspectObject,
    lessonVideoPrefix,
} from "@/lib/storage";

export type EditorActionResult = { ok: boolean; message: string };

const DENIED: EditorActionResult = {
    ok: false,
    message: "Only the instructor who owns this course can edit it.",
};
const MISSING: EditorActionResult = {
    ok: false,
    message: "That course could not be found.",
};

async function owned(courseId: string) {
    const session = await getSession();
    if (!session) return null;
    if (!(await canTeach(session.user))) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const course = await db.course.findFirst({
        where: { id: courseId, instructorId: profile.id },
        select: { id: true, slug: true, title: true, status: true },
    });
    if (!course) return null;

    return { course, userId: session.user.id, role: session.user.role ?? null };
}

function revalidateEditor() {
    revalidatePath("/dashboard", "layout");
}

export async function createCourse(input: {
    title: string;
    categoryId: string;
}): Promise<EditorActionResult & { slug?: string }> {
    const session = await getSession();
    if (!session) return DENIED;
    if (!(await canTeach(session.user))) return DENIED;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return DENIED;

    const title = input.title.trim().slice(0, 200);
    if (title === "")
        return { ok: false, message: "Give your course a title." };

    const category = await db.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
    });
    if (!category) return { ok: false, message: "Pick a category." };

    const course = await db.course.create({
        data: {
            slug: await uniqueCourseSlug(title),
            title,
            subtitle: "",
            instructorId: profile.id,
            categoryId: category.id,
            level: "BEGINNER",
            durationHours: 0,
            priceCents: 0,
            listPriceCents: 0,
            status: "DRAFT",
        },
        select: { slug: true },
    });

    revalidateEditor();
    return { ok: true, message: "", slug: course.slug };
}

async function uniqueCourseSlug(title: string): Promise<string> {
    const base =
        title
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "course";

    for (let suffix = 0; suffix < 100; suffix += 1) {
        const slug = suffix === 0 ? base : `${base}-${suffix + 1}`;
        const taken = await db.course.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (!taken) return slug;
    }
    return `${base}-${Date.now()}`;
}

export async function saveIntendedLearners(
    courseId: string,
    input: {
        learningOutcomes: string[];
        requirements: string[];
        intendedAudience: string;
    },
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const clean = (rows: string[]) =>
        rows
            .map((row) => row.trim())
            .filter((row) => row !== "")
            .slice(0, 20)
            .map((row) => row.slice(0, 300));

    const audience = input.intendedAudience.trim().slice(0, 1000);

    await db.course.update({
        where: { id: found.course.id },
        data: {
            learningOutcomes: clean(input.learningOutcomes),
            requirements: clean(input.requirements),
            intendedAudience: audience === "" ? null : audience,
        },
    });

    revalidateEditor();
    return { ok: true, message: "Saved." };
}

export async function saveLandingPage(
    courseId: string,
    input: { title: string; subtitle: string; description: string },
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const title = String(input.title ?? "")
        .trim()
        .slice(0, LANDING_LIMITS.title);
    if (title === "") {
        return { ok: false, message: landingPageCopy.errors.title };
    }
    const subtitle = String(input.subtitle ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, LANDING_LIMITS.subtitle);
    const description = String(input.description ?? "")
        .slice(0, LANDING_LIMITS.description)
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph !== "");

    await db.course.update({
        where: { id: found.course.id },
        data: { title, subtitle, description },
    });

    revalidateEditor();
    return { ok: true, message: landingPageCopy.saved };
}

export async function uploadCourseCover(
    courseId: string,
    formData: FormData,
): Promise<EditorActionResult & { url?: string }> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, message: landingPageCopy.cover.wrongType };
    }
    if (!(COVER_MIME_TYPES as readonly string[]).includes(file.type)) {
        return { ok: false, message: landingPageCopy.cover.wrongType };
    }
    if (file.size > COVER_MAX_BYTES) {
        return { ok: false, message: landingPageCopy.cover.tooLarge };
    }

    const url = await putCourseCover(found.course.id, {
        bytes: new Uint8Array(await file.arrayBuffer()),
        contentType: file.type,
    });
    if (!url) return { ok: false, message: landingPageCopy.cover.unconfigured };

    const previous = await db.course.findUnique({
        where: { id: found.course.id },
        select: { thumbnailUrl: true },
    });
    await db.course.update({
        where: { id: found.course.id },
        data: { thumbnailUrl: url },
    });
    await deleteCourseCover(found.course.id, previous?.thumbnailUrl ?? null);

    revalidateEditor();
    return { ok: true, message: landingPageCopy.cover.updated, url };
}

export async function savePricing(
    courseId: string,
    input: {
        currency: string;
        listPriceCents: number;
        includedInBusiness: boolean;
    },
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    if (
        !COURSE_CURRENCIES.some((currency) => currency.value === input.currency)
    ) {
        return { ok: false, message: pricingCopy.errors.currency };
    }

    const course = await db.course.findUnique({
        where: { id: found.course.id },
        select: { priceCents: true, listPriceCents: true, saleEndsAt: true },
    });
    if (!course) return MISSING;

    const list = Math.round(Number(input.listPriceCents));
    const allowed =
        (PRICE_TIERS_CENTS as readonly number[]).includes(list) ||
        (list === course.listPriceCents && list > 0);
    if (!allowed) return { ok: false, message: pricingCopy.errors.price };

    const onSale =
        course.saleEndsAt !== null &&
        course.saleEndsAt > new Date() &&
        course.listPriceCents > 0 &&
        course.priceCents < course.listPriceCents;
    const price = onSale
        ? Math.round((list * course.priceCents) / course.listPriceCents)
        : list;

    await db.course.update({
        where: { id: found.course.id },
        data: {
            currency: input.currency,
            listPriceCents: list,
            priceCents: price,
            includedInBusiness: input.includedInBusiness === true,
        },
    });

    revalidateEditor();
    return { ok: true, message: pricingCopy.saved };
}

export async function saveCourseMessages(
    courseId: string,
    input: { welcomeMessage: string; congratulationsMessage: string },
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const clean = (value: unknown) => {
        const text = String(value ?? "")
            .trim()
            .slice(0, COURSE_MESSAGE_MAX);
        return text === "" ? null : text;
    };

    await db.course.update({
        where: { id: found.course.id },
        data: {
            welcomeMessage: clean(input.welcomeMessage),
            congratulationsMessage: clean(input.congratulationsMessage),
        },
    });

    revalidateEditor();
    return { ok: true, message: courseMessagesCopy.saved };
}

export async function addSection(
    courseId: string,
): Promise<EditorActionResult & { section?: EditorSection }> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const count = await db.courseSection.count({
        where: { courseId: found.course.id },
    });
    const created = await db.courseSection.create({
        data: {
            courseId: found.course.id,
            title: curriculumCopy.newSectionTitle,
            order: count,
        },
        select: { id: true, title: true },
    });

    revalidateEditor();
    return {
        ok: true,
        message: "",
        section: { id: created.id, title: created.title, lessons: [] },
    };
}

export async function renameSection(
    courseId: string,
    sectionId: string,
    title: string,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const trimmed = title.trim().slice(0, 200);
    if (trimmed === "") {
        return { ok: false, message: "A section needs a name." };
    }

    const { count } = await db.courseSection.updateMany({
        where: { id: sectionId, courseId: found.course.id },
        data: { title: trimmed },
    });
    if (count === 0) return MISSING;

    return { ok: true, message: "" };
}

export async function deleteSection(
    courseId: string,
    sectionId: string,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const section = await db.courseSection.findFirst({
        where: { id: sectionId, courseId: found.course.id },
        select: {
            id: true,
            title: true,
            _count: { select: { lessons: true } },
            lessons: { select: { id: true } },
        },
    });
    if (!section) return MISSING;

    await db.$transaction(async (tx) => {
        await tx.courseSection.delete({ where: { id: section.id } });
        await resequence(tx, found.course.id);
    });
    await dropLessonVideos(
        found.course.id,
        section.lessons.map((lesson) => lesson.id),
    );
    await syncCourseTotals(found.course.id);

    revalidateEditor();
    return {
        ok: true,
        message:
            section._count.lessons === 0
                ? `“${section.title}” deleted.`
                : `“${section.title}” and its ${section._count.lessons} ${
                      section._count.lessons === 1 ? "lesson" : "lessons"
                  } deleted.`,
    };
}

export async function moveSection(
    courseId: string,
    sectionId: string,
    toIndex: number,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const sections = await db.courseSection.findMany({
        where: { courseId: found.course.id },
        orderBy: { order: "asc" },
        select: { id: true },
    });
    const from = sections.findIndex((section) => section.id === sectionId);
    if (from === -1) return MISSING;

    const target = clamp(toIndex, 0, sections.length - 1);
    if (target === from) return { ok: true, message: "" };

    const ordered = reorder(sections, from, target);
    await db.$transaction(
        ordered.map((section, index) =>
            db.courseSection.update({
                where: { id: section.id },
                data: { order: index },
            }),
        ),
    );

    return { ok: true, message: "" };
}

export async function addLesson(
    courseId: string,
    sectionId: string,
    kind: LessonKind,
): Promise<EditorActionResult & { lesson?: EditorLesson }> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const section = await db.courseSection.findFirst({
        where: { id: sectionId, courseId: found.course.id },
        select: { id: true },
    });
    if (!section) return MISSING;

    const count = await db.courseLesson.count({
        where: { sectionId: section.id },
    });
    const created = await db.courseLesson.create({
        data: {
            sectionId: section.id,
            title: curriculumCopy.newLessonTitle[kind],
            type: kind,
            order: count,
            isPublished: false,
        },
        select: { id: true, title: true },
    });
    await syncCourseTotals(found.course.id);

    revalidateEditor();
    return {
        ok: true,
        message: "",
        lesson: {
            id: created.id,
            title: created.title,
            kind,
            durationMinutes: null,
            questionsCount: null,
            isPreview: false,
            hasQuiz: false,
            video: null,
            hasArticle: false,
        },
    };
}

export async function updateLesson(
    courseId: string,
    lessonId: string,
    input: {
        title?: string;
        durationMinutes?: number | null;
        questionsCount?: number | null;
        isPreview?: boolean;
    },
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await db.courseLesson.findFirst({
        where: { id: lessonId, section: { courseId: found.course.id } },
        select: { id: true, type: true },
    });
    if (!lesson) return MISSING;

    const data: {
        title?: string;
        durationMinutes?: number | null;
        questionsCount?: number | null;
        isPreview?: boolean;
    } = {};

    if (input.title !== undefined) {
        const trimmed = input.title.trim().slice(0, 300);
        if (trimmed === "")
            return { ok: false, message: "A lesson needs a name." };
        data.title = trimmed;
    }
    if (input.durationMinutes !== undefined) {
        data.durationMinutes =
            input.durationMinutes === null
                ? null
                : clamp(Math.round(input.durationMinutes), 0, 6000);
    }
    if (input.questionsCount !== undefined) {
        data.questionsCount =
            input.questionsCount === null
                ? null
                : clamp(Math.round(input.questionsCount), 0, 200);
    }
    if (input.isPreview !== undefined) {
        if (lesson.type === "QUIZ") {
            return { ok: false, message: "A quiz can't be a free preview." };
        }
        data.isPreview = input.isPreview;
    }

    await db.courseLesson.update({ where: { id: lesson.id }, data });

    if (input.durationMinutes !== undefined) {
        await syncCourseTotals(found.course.id);
        revalidateEditor();
    }

    return { ok: true, message: "" };
}

export async function deleteLesson(
    courseId: string,
    lessonId: string,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await db.courseLesson.findFirst({
        where: { id: lessonId, section: { courseId: found.course.id } },
        select: { id: true, title: true, sectionId: true },
    });
    if (!lesson) return MISSING;

    await db.$transaction(async (tx) => {
        await tx.courseLesson.delete({ where: { id: lesson.id } });
        await resequenceLessons(tx, lesson.sectionId);
    });
    await dropLessonVideos(found.course.id, [lesson.id]);
    await syncCourseTotals(found.course.id);

    revalidateEditor();
    return { ok: true, message: `“${lesson.title}” deleted.` };
}

export async function moveLesson(
    courseId: string,
    lessonId: string,
    toIndex: number,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await db.courseLesson.findFirst({
        where: { id: lessonId, section: { courseId: found.course.id } },
        select: { id: true, sectionId: true },
    });
    if (!lesson) return MISSING;

    const lessons = await db.courseLesson.findMany({
        where: { sectionId: lesson.sectionId },
        orderBy: { order: "asc" },
        select: { id: true },
    });
    const from = lessons.findIndex((row) => row.id === lesson.id);
    const target = clamp(toIndex, 0, lessons.length - 1);
    if (from === -1 || from === target) return { ok: true, message: "" };

    const ordered = reorder(lessons, from, target);
    await db.$transaction(
        ordered.map((row, index) =>
            db.courseLesson.update({
                where: { id: row.id },
                data: { order: index },
            }),
        ),
    );
    return { ok: true, message: "" };
}

export async function startLessonVideoUpload(
    courseId: string,
    lessonId: string,
    file: { contentType: string; sizeBytes: number },
): Promise<EditorActionResult & { uploadUrl?: string; key?: string }> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await ownedLessonOfType(found.course.id, lessonId, "VIDEO");
    if (!lesson) return MISSING;

    if (!isVideoType(file.contentType)) {
        return { ok: false, message: lessonVideoCopy.wrongType };
    }
    if (file.sizeBytes > LESSON_VIDEO_MAX_BYTES) {
        return { ok: false, message: lessonVideoCopy.tooLarge };
    }

    const upload = await createLessonVideoUpload(
        found.course.id,
        lesson.id,
        file.contentType,
    );
    if (!upload) return { ok: false, message: lessonVideoCopy.unconfigured };

    return { ok: true, message: "", ...upload };
}

export async function attachLessonVideo(
    courseId: string,
    lessonId: string,
    input: { key: string; fileName: string; durationSeconds: number | null },
): Promise<
    EditorActionResult & {
        video?: EditorVideo;
        durationMinutes?: number | null;
    }
> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await ownedLessonOfType(found.course.id, lessonId, "VIDEO");
    if (!lesson) return MISSING;

    if (!input.key.startsWith(lessonVideoPrefix(found.course.id, lesson.id))) {
        return { ok: false, message: lessonVideoCopy.failed };
    }

    const object = await inspectObject(input.key);
    if (!object) return { ok: false, message: lessonVideoCopy.failed };
    if (
        !isVideoType(object.contentType) ||
        object.sizeBytes > LESSON_VIDEO_MAX_BYTES
    ) {
        await deleteLessonObject(found.course.id, lesson.id, input.key);
        return { ok: false, message: lessonVideoCopy.wrongType };
    }

    const seconds =
        input.durationSeconds !== null && Number.isFinite(input.durationSeconds)
            ? clamp(Math.round(input.durationSeconds), 0, 24 * 60 * 60)
            : null;
    const minutes =
        seconds === null
            ? lesson.durationMinutes
            : Math.max(1, Math.round(seconds / 60));
    const fileName = input.fileName.trim().slice(0, 200) || null;

    const previous = lesson.videoAssetId
        ? await db.mediaAsset.findFirst({
              where: { id: lesson.videoAssetId, ownerId: lesson.id },
              select: { id: true, storageKey: true },
          })
        : null;

    await db.$transaction(async (tx) => {
        const asset = await tx.mediaAsset.create({
            data: {
                ownerType: "LESSON_VIDEO",
                ownerId: lesson.id,
                title: fileName,
                storageKey: input.key,
                url: object.url,
                mimeType: object.contentType,
                sizeBytes: object.sizeBytes,
                durationSeconds: seconds,
                uploadedById: found.userId,
            },
            select: { id: true },
        });
        await tx.courseLesson.update({
            where: { id: lesson.id },
            data: { videoAssetId: asset.id, durationMinutes: minutes },
        });
        if (previous) {
            await tx.mediaAsset.delete({ where: { id: previous.id } });
        }
    });
    if (previous) {
        await deleteLessonObject(
            found.course.id,
            lesson.id,
            previous.storageKey,
        );
    }

    await syncCourseTotals(found.course.id);
    revalidateEditor();
    return {
        ok: true,
        message: lessonVideoCopy.uploaded,
        video: {
            url: object.url,
            fileName,
            sizeBytes: object.sizeBytes,
            durationSeconds: seconds,
        },
        durationMinutes: minutes,
    };
}

export async function removeLessonVideo(
    courseId: string,
    lessonId: string,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await ownedLessonOfType(found.course.id, lessonId, "VIDEO");
    if (!lesson) return MISSING;

    await db.courseLesson.update({
        where: { id: lesson.id },
        data: { videoAssetId: null },
    });
    await dropLessonVideos(found.course.id, [lesson.id]);

    revalidateEditor();
    return { ok: true, message: lessonVideoCopy.removed };
}

export async function saveArticle(
    courseId: string,
    lessonId: string,
    input: string,
): Promise<
    EditorActionResult & { body?: ArticleDoc; durationMinutes?: number | null }
> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await db.courseLesson.findFirst({
        where: {
            id: lessonId,
            section: { courseId: found.course.id },
            type: { in: ["ARTICLE", "PRACTICE"] },
        },
        select: { id: true },
    });
    if (!lesson) return MISSING;

    if (typeof input !== "string" || input.length > ARTICLE_MAX_CHARS * 4) {
        return { ok: false, message: "That article is too long to save." };
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch {
        return { ok: false, message: "That article couldn't be read." };
    }
    const doc = sanitizeArticle(parsed);
    if (!doc) return { ok: false, message: "That article couldn't be read." };

    const serialized = JSON.stringify(doc);
    if (serialized.length > ARTICLE_MAX_CHARS) {
        return { ok: false, message: "That article is too long to save." };
    }

    const words = articleWordCount(doc);
    const minutes = words === 0 ? null : Math.max(1, Math.ceil(words / 200));

    await db.courseLesson.update({
        where: { id: lesson.id },
        data: {
            articleBody: words === 0 ? null : serialized,
            durationMinutes: minutes,
        },
    });
    await syncCourseTotals(found.course.id);

    revalidateEditor();
    return {
        ok: true,
        message: articleEditorCopy.saved,
        body: doc,
        durationMinutes: minutes,
    };
}

export async function saveQuiz(
    courseId: string,
    lessonId: string,
    input: QuizDraftQuestion[],
): Promise<EditorActionResult & { questions?: QuizDraftQuestion[] }> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    const lesson = await ownedLessonOfType(found.course.id, lessonId, "QUIZ");
    if (!lesson) return MISSING;

    if (!Array.isArray(input)) return MISSING;
    const questions: QuizDraftQuestion[] = input
        .slice(0, QUIZ_LIMITS.questions + 1)
        .map((question) => ({
            id: typeof question?.id === "string" ? question.id : undefined,
            prompt: String(question?.prompt ?? "")
                .trim()
                .slice(0, QUIZ_LIMITS.prompt),
            options: (Array.isArray(question?.options) ? question.options : [])
                .slice(0, QUIZ_LIMITS.maxOptions)
                .map((option) => ({
                    id: typeof option?.id === "string" ? option.id : undefined,
                    label: String(option?.label ?? "")
                        .trim()
                        .slice(0, QUIZ_LIMITS.option),
                    isCorrect: option?.isCorrect === true,
                })),
        }));

    const invalid = validateQuizDraft(questions);
    if (invalid) return { ok: false, message: invalid.message };

    const saved = await db.$transaction(async (tx) => {
        const quiz = await tx.quiz.upsert({
            where: { lessonId: lesson.id },
            create: { lessonId: lesson.id, title: lesson.title },
            update: { title: lesson.title },
            select: {
                id: true,
                questions: {
                    select: { id: true, options: { select: { id: true } } },
                },
            },
        });

        const existing = new Map(
            quiz.questions.map((question) => [
                question.id,
                new Set(question.options.map((option) => option.id)),
            ]),
        );
        const kept = new Set(
            questions.flatMap((question) =>
                question.id && existing.has(question.id) ? [question.id] : [],
            ),
        );
        const removed = [...existing.keys()].filter((id) => !kept.has(id));
        if (removed.length > 0) {
            await tx.quizQuestion.deleteMany({
                where: { id: { in: removed }, quizId: quiz.id },
            });
        }

        const result: QuizDraftQuestion[] = [];
        for (const [order, question] of questions.entries()) {
            const ownOptions =
                question.id && kept.has(question.id)
                    ? existing.get(question.id)!
                    : null;

            const row = ownOptions
                ? await tx.quizQuestion.update({
                      where: { id: question.id },
                      data: { prompt: question.prompt, order },
                      select: { id: true },
                  })
                : await tx.quizQuestion.create({
                      data: { quizId: quiz.id, prompt: question.prompt, order },
                      select: { id: true },
                  });

            const keptOptions = new Set(
                question.options.flatMap((option) =>
                    option.id && ownOptions?.has(option.id) ? [option.id] : [],
                ),
            );
            const staleOptions = [...(ownOptions ?? [])].filter(
                (id) => !keptOptions.has(id),
            );
            if (staleOptions.length > 0) {
                await tx.quizOption.deleteMany({
                    where: { id: { in: staleOptions }, questionId: row.id },
                });
            }

            const options = [];
            for (const [optionOrder, option] of question.options.entries()) {
                const data = {
                    label: option.label,
                    isCorrect: option.isCorrect,
                    order: optionOrder,
                };
                const saved =
                    option.id && keptOptions.has(option.id)
                        ? await tx.quizOption.update({
                              where: { id: option.id },
                              data,
                              select: { id: true },
                          })
                        : await tx.quizOption.create({
                              data: { ...data, questionId: row.id },
                              select: { id: true },
                          });
                options.push({ ...data, id: saved.id });
            }

            result.push({
                id: row.id,
                prompt: question.prompt,
                options: options.map(({ id, label, isCorrect }) => ({
                    id,
                    label,
                    isCorrect,
                })),
            });
        }

        await tx.courseLesson.update({
            where: { id: lesson.id },
            data: { questionsCount: result.length },
        });

        return result;
    });

    revalidateEditor();
    return { ok: true, message: quizEditorCopy.saved, questions: saved };
}

export async function publishCourse(
    courseId: string,
): Promise<EditorActionResult> {
    const found = await owned(courseId);
    if (!found) return DENIED;

    if (
        found.course.status !== "DRAFT" &&
        found.course.status !== "NEEDS_CHANGES"
    ) {
        return {
            ok: false,
            message: "This course isn't in a state that can be submitted.",
        };
    }

    const course = await db.course.findUnique({
        where: { id: found.course.id },
        select: {
            id: true,
            title: true,
            learningOutcomes: true,
            durationHours: true,
            thumbnailUrl: true,
            instructor: { select: { name: true } },
            sections: {
                select: {
                    lessons: { select: { id: true, type: true, order: true } },
                },
            },
        },
    });
    if (!course) return MISSING;

    const lessons = course.sections.flatMap((section) => section.lessons);
    if (lessons.length === 0) {
        return {
            ok: false,
            message: "Add at least one lesson on the Curriculum step first.",
        };
    }
    if (course.learningOutcomes.length === 0) {
        return {
            ok: false,
            message: "Fill in the Intended learners step first.",
        };
    }

    const longEnough = lessons.length >= 10 && course.durationHours >= 5;
    const hasQuiz = lessons.some((lesson) => lesson.type === "QUIZ");

    await db.$transaction(async (tx) => {
        const submission = await tx.courseSubmission.create({
            data: {
                courseId: course.id,
                submittedById: found.userId,
            },
            select: { id: true },
        });
        await tx.courseSubmissionCheck.createMany({
            data: [
                {
                    submissionId: submission.id,
                    key: "min_lessons_and_video",
                    label: "At least 10 lessons and 5 hours of video",
                    passed: longEnough,
                },
                {
                    submissionId: submission.id,
                    key: "closes_with_quiz",
                    label: "Closes with a graded quiz or project",
                    passed: hasQuiz,
                },
            ],
        });
        await tx.course.update({
            where: { id: course.id },
            data: { status: "IN_REVIEW", submittedAt: new Date() },
        });
        await tx.auditLog.create({
            data: {
                actorId: found.userId,
                actorName: found.course.title,
                actorRole: found.role,
                action: "course.submitted",
                targetType: "course",
                targetId: course.id,
                targetLabel: course.title,
                category: "COURSES",
            },
        });
    });

    await notifyCourseSubmitted({
        courseId: course.id,
        courseTitle: course.title,
        instructorName: course.instructor?.name ?? "An instructor",
        instructorUserId: found.userId,
    });

    revalidateEditor();
    return {
        ok: true,
        message: `“${course.title}” is with the review team.`,
    };
}

async function ownedLessonOfType(
    courseId: string,
    lessonId: string,
    type: "VIDEO" | "QUIZ",
) {
    return db.courseLesson.findFirst({
        where: { id: lessonId, type, section: { courseId } },
        select: {
            id: true,
            title: true,
            durationMinutes: true,
            videoAssetId: true,
        },
    });
}

function isVideoType(contentType: string) {
    return (LESSON_VIDEO_TYPES as readonly string[]).includes(contentType);
}

async function dropLessonVideos(courseId: string, lessonIds: string[]) {
    if (lessonIds.length === 0) return;
    const assets = await db.mediaAsset.findMany({
        where: { ownerType: "LESSON_VIDEO", ownerId: { in: lessonIds } },
        select: { id: true, ownerId: true, storageKey: true },
    });
    if (assets.length === 0) return;

    await db.mediaAsset.deleteMany({
        where: { id: { in: assets.map((asset) => asset.id) } },
    });
    await Promise.all(
        assets.map((asset) =>
            deleteLessonObject(courseId, asset.ownerId, asset.storageKey),
        ),
    );
}

function clamp(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
}

function reorder<T>(rows: T[], from: number, to: number): T[] {
    const next = rows.slice();
    const [moved] = next.splice(from, 1);
    if (moved !== undefined) next.splice(to, 0, moved);
    return next;
}

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function resequence(tx: Tx, courseId: string) {
    const sections = await tx.courseSection.findMany({
        where: { courseId },
        orderBy: { order: "asc" },
        select: { id: true },
    });
    for (const [index, section] of sections.entries()) {
        await tx.courseSection.update({
            where: { id: section.id },
            data: { order: index },
        });
    }
}

async function resequenceLessons(tx: Tx, sectionId: string) {
    const lessons = await tx.courseLesson.findMany({
        where: { sectionId },
        orderBy: { order: "asc" },
        select: { id: true },
    });
    for (const [index, lesson] of lessons.entries()) {
        await tx.courseLesson.update({
            where: { id: lesson.id },
            data: { order: index },
        });
    }
}

async function syncCourseTotals(courseId: string) {
    const lessons = await db.courseLesson.findMany({
        where: { section: { courseId } },
        select: { durationMinutes: true },
    });
    const minutes = lessons.reduce(
        (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
        0,
    );

    await db.course.update({
        where: { id: courseId },
        data: {
            lessonCount: lessons.length,
            totalDurationMinutes: minutes,
            durationHours: Math.round(minutes / 60),
        },
    });
}
