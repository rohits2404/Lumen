import "server-only";

import { db } from "@/lib/db";
import { notifyCourseCompleted, notifyStudentCompleted } from "@/lib/notify";

function buildSerial(categorySlug: string, seed: string): string {
    const letters = categorySlug
        .split("-")
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2)
        .padEnd(2, "X");

    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return `LMN-${letters}-${String(Math.abs(hash) % 10000).padStart(4, "0")}`;
}

function buildPublicSlug(seed: string): string {
    let a = 2166136261;
    let b = 1099511628211;
    for (let i = 0; i < seed.length; i += 1) {
        a ^= seed.charCodeAt(i);
        a = Math.imul(a, 16777619);
        b ^= seed.charCodeAt(seed.length - 1 - i);
        b = Math.imul(b, 16777619);
    }
    return (
        Math.abs(a).toString(36).padStart(7, "0") +
        Math.abs(b).toString(36).padStart(7, "0")
    ).slice(0, 14);
}

function gradeFor(percent: number): string | null {
    if (percent >= 90) return "A";
    if (percent >= 80) return "B";
    if (percent >= 70) return "C";
    return null;
}

async function sendCongratulations(input: {
    learnerUserId: string;
    instructorUserId: string;
    courseId: string;
    body: string;
}) {
    const existing = await db.conversation.findFirst({
        where: {
            courseId: input.courseId,
            AND: [
                { participants: { some: { userId: input.learnerUserId } } },
                { participants: { some: { userId: input.instructorUserId } } },
            ],
        },
        select: { id: true },
    });

    const conversationId =
        existing?.id ??
        (
            await db.conversation.create({
                data: {
                    courseId: input.courseId,
                    participants: {
                        create: [
                            { userId: input.learnerUserId },
                            {
                                userId: input.instructorUserId,
                                lastReadAt: new Date(),
                            },
                        ],
                    },
                },
                select: { id: true },
            })
        ).id;

    await db.message.create({
        data: {
            conversationId,
            senderId: input.instructorUserId,
            body: input.body,
        },
    });
    await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
    });
}

async function issueCertificate(enrollmentId: string) {
    const existing = await db.certificate.findUnique({
        where: { enrollmentId },
        select: { publicSlug: true },
    });
    if (existing) return existing.publicSlug;

    const enrolment = await db.enrollment.findUnique({
        where: { id: enrollmentId },
        select: {
            id: true,
            userId: true,
            progressPercent: true,
            course: {
                select: {
                    id: true,
                    title: true,
                    category: { select: { slug: true } },
                },
            },
        },
    });
    if (!enrolment) return null;

    const serial = buildSerial(enrolment.course.category.slug, enrolment.id);
    const publicSlug = buildPublicSlug(enrolment.id + enrolment.course.id);

    try {
        await db.certificate.create({
            data: {
                serial,
                publicSlug,
                enrollmentId: enrolment.id,
                userId: enrolment.userId,
                courseId: enrolment.course.id,
                grade: gradeFor(enrolment.progressPercent),
                scorePercent: enrolment.progressPercent,
            },
        });
    } catch {
        return (
            (
                await db.certificate.findUnique({
                    where: { enrollmentId },
                    select: { publicSlug: true },
                })
            )?.publicSlug ?? null
        );
    }

    return publicSlug;
}

export async function recountEnrolment(enrollmentId: string): Promise<void> {
    const enrolment = await db.enrollment.findUnique({
        where: { id: enrollmentId },
        select: {
            id: true,
            userId: true,
            completedAt: true,
            course: {
                select: {
                    id: true,
                    title: true,
                    congratulationsMessage: true,
                    instructor: { select: { userId: true } },
                    sections: { select: { lessons: { select: { id: true } } } },
                },
            },
        },
    });
    if (!enrolment) return;

    const total = enrolment.course.sections.reduce(
        (sum, section) => sum + section.lessons.length,
        0,
    );
    const done = await db.lessonProgress.count({
        where: { enrollmentId: enrolment.id, NOT: { completedAt: null } },
    });

    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const finished = total > 0 && done >= total;
    const completedAt = enrolment.completedAt ?? (finished ? new Date() : null);

    await db.enrollment.update({
        where: { id: enrolment.id },
        data: {
            completedLessons: done,
            progressPercent: percent,
            lastAccessedAt: new Date(),
            completedAt,
        },
    });

    if (!finished || enrolment.completedAt) return;

    const publicSlug = await issueCertificate(enrolment.id);

    const learner = await db.user.findUnique({
        where: { id: enrolment.userId },
        select: { name: true, email: true },
    });
    const learnerName = learner?.name?.trim() || learner?.email || "A student";

    const closing = enrolment.course.congratulationsMessage?.trim();
    if (closing && enrolment.course.instructor.userId) {
        await sendCongratulations({
            learnerUserId: enrolment.userId,
            instructorUserId: enrolment.course.instructor.userId,
            courseId: enrolment.course.id,
            body: closing,
        }).catch((error) => {
            console.error("[completion] congratulations message failed", error);
        });
    }

    await notifyCourseCompleted({
        learnerUserId: enrolment.userId,
        courseId: enrolment.course.id,
        courseTitle: enrolment.course.title,
        certificateSlug: publicSlug,
    });
    await notifyStudentCompleted({
        instructorUserId: enrolment.course.instructor.userId,
        learnerUserId: enrolment.userId,
        learnerName,
        courseId: enrolment.course.id,
        courseTitle: enrolment.course.title,
    });
}

export async function setLessonComplete(input: {
    enrollmentId: string;
    lessonId: string;
    complete: boolean;
}): Promise<void> {
    const completedAt = input.complete ? new Date() : null;

    await db.lessonProgress.upsert({
        where: {
            enrollmentId_lessonId: {
                enrollmentId: input.enrollmentId,
                lessonId: input.lessonId,
            },
        },
        create: {
            enrollmentId: input.enrollmentId,
            lessonId: input.lessonId,
            completedAt,
        },
        update: { completedAt },
    });

    await recountEnrolment(input.enrollmentId);
}
