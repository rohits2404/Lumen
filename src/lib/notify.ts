import "server-only";

import { db } from "@/lib/db";
import type {
    NotificationAudience,
    NotificationCategory,
} from "@/generated/prisma/enums";

type NotifyInput = {
    userId: string;
    audience: NotificationAudience;
    category: NotificationCategory;
    title: string;
    body?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    actorId?: string | null;
};

async function notify(input: NotifyInput): Promise<void> {
    try {
        await db.notification.create({
            data: {
                userId: input.userId,
                audience: input.audience,
                category: input.category,
                title: input.title,
                body: input.body ?? null,
                targetType: input.targetType ?? null,
                targetId: input.targetId ?? null,
                actorId: input.actorId ?? null,
            },
        });
    } catch (error) {
        console.error("[notify] Could Not Write Notification", error);
    }
}

async function notifyMany(
    userIds: string[],
    input: Omit<NotifyInput, "userId">,
): Promise<void> {
    await Promise.all(userIds.map((userId) => notify({ ...input, userId })));
}

async function adminUserIds(): Promise<string[]> {
    const admins = await db.user.findMany({
        where: { role: "admin" },
        select: { id: true },
    });
    return admins.map((admin) => admin.id);
}

export async function notifyCourseSubmitted(input: {
    courseId: string;
    courseTitle: string;
    instructorName: string;
    instructorUserId: string | null;
}) {
    const admins = await adminUserIds();
    await notifyMany(admins, {
        audience: "ADMIN",
        category: "COURSE",
        title: `${input.courseTitle} Is Awaiting Review`,
        body: `${input.instructorName} Submitted It For Approval.`,
        targetType: "course",
        targetId: input.courseId,
        actorId: input.instructorUserId,
    });
}

export async function notifyCourseDecision(input: {
    instructorUserId: string | null;
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    outcome: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
    note?: string | null;
}) {
    if (!input.instructorUserId) return;

    const copy = {
        APPROVED: {
            title: `${input.courseTitle} is live`,
            body: "It has been approved and is now on sale in the catalog.",
        },
        CHANGES_REQUESTED: {
            title: `${input.courseTitle} needs changes`,
            body: input.note?.trim()
                ? input.note.trim()
                : "A reviewer has asked for changes before it can go live.",
        },
        REJECTED: {
            title: `${input.courseTitle} was not approved`,
            body: input.note?.trim()
                ? input.note.trim()
                : "A reviewer turned this submission down.",
        },
    }[input.outcome];

    await notify({
        userId: input.instructorUserId,
        audience: "INSTRUCTOR",
        category: "COURSE",
        title: copy.title,
        body: copy.body,
        targetType: "course",
        targetId: input.courseId,
    });
}

export async function notifyCoursePurchased(input: {
    learnerUserId: string;
    learnerName: string;
    instructorUserId: string | null;
    courseId: string;
    courseTitle: string;
}) {
    await notify({
        userId: input.learnerUserId,
        audience: "LEARNER",
        category: "COURSE",
        title: `You're Enrolled In ${input.courseTitle}`,
        body: "Start Whenever You Like — It's In My Learning.",
        targetType: "course",
        targetId: input.courseId,
    });

    if (
        input.instructorUserId &&
        input.instructorUserId !== input.learnerUserId
    ) {
        await notify({
            userId: input.instructorUserId,
            audience: "INSTRUCTOR",
            category: "COURSE",
            title: `New Enrolment In ${input.courseTitle}`,
            body: `${input.learnerName} Just Enrolled.`,
            targetType: "course",
            targetId: input.courseId,
            actorId: input.learnerUserId,
        });
    }
}

export async function notifyCourseCompleted(input: {
    learnerUserId: string;
    courseId: string;
    courseTitle: string;
    certificateSlug: string | null;
}) {
    await notify({
        userId: input.learnerUserId,
        audience: "LEARNER",
        category: "CERTIFICATE",
        title: `Certificate Ready For ${input.courseTitle}`,
        body: "You Finished The Course — Your Certificate Is Ready To Download.",
        targetType: "certificate",
        targetId: input.certificateSlug,
    });
}

export async function notifyStudentCompleted(input: {
    instructorUserId: string | null;
    learnerUserId: string;
    learnerName: string;
    courseId: string;
    courseTitle: string;
}) {
    if (
        !input.instructorUserId ||
        input.instructorUserId === input.learnerUserId
    )
        return;

    await notify({
        userId: input.instructorUserId,
        audience: "INSTRUCTOR",
        category: "COURSE",
        title: `${input.learnerName} Completed ${input.courseTitle}`,
        body: "They Have Been Issued A Certificate.",
        targetType: "course",
        targetId: input.courseId,
        actorId: input.learnerUserId,
    });
}

export { notify, notifyMany };
