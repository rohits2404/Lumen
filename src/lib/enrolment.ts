import "server-only";

import { db } from "@/lib/db";
import { notifyCoursePurchased } from "@/lib/notify";
import type { EnrollmentSource } from "@/generated/prisma/enums";

async function sendWelcomeMessage(input: {
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

export async function enrolInCourse(input: {
    userId: string;
    courseId: string;
    source?: EnrollmentSource;
    orderId?: string | null;
}): Promise<{ created: boolean }> {
    const course = await db.course.findUnique({
        where: { id: input.courseId },
        select: {
            id: true,
            title: true,
            welcomeMessage: true,
            instructor: { select: { userId: true } },
        },
    });
    if (!course) return { created: false };

    const existing = await db.enrollment.findUnique({
        where: {
            userId_courseId: { userId: input.userId, courseId: course.id },
        },
        select: { id: true },
    });
    if (existing) return { created: false };

    try {
        await db.enrollment.create({
            data: {
                userId: input.userId,
                courseId: course.id,
                source: input.source ?? "PURCHASE",
                orderId: input.orderId ?? null,
                lastAccessedAt: new Date(),
            },
        });
    } catch {
        return { created: false };
    }

    await db.course.update({
        where: { id: course.id },
        data: { enrollmentCount: { increment: 1 } },
    });

    const learner = await db.user.findUnique({
        where: { id: input.userId },
        select: { name: true, email: true },
    });
    const learnerName =
        learner?.name?.trim() || learner?.email || "A new student";

    const welcome = course.welcomeMessage?.trim();
    if (welcome && course.instructor.userId) {
        await sendWelcomeMessage({
            learnerUserId: input.userId,
            instructorUserId: course.instructor.userId,
            courseId: course.id,
            body: welcome,
        }).catch((error) => {
            console.error("[enrol] Welcome Message Failed", error);
        });
    }

    await notifyCoursePurchased({
        learnerUserId: input.userId,
        learnerName,
        instructorUserId: course.instructor.userId,
        courseId: course.id,
        courseTitle: course.title,
    });

    return { created: true };
}
