"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyCourseDecision } from "@/lib/notify";
import {
    changeReasonOptions,
    NOTE_MAX_LENGTH,
} from "@/lib/config/admin-courses";
import type {
    ChangeReason,
    CourseStatus,
    SubmissionDecision,
} from "@/generated/prisma/client";

export type AdminCoursesResult = { ok: boolean; message: string };

const DENIED: AdminCoursesResult = {
    ok: false,
    message: "You do not have access to course review.",
};

const reasonValues = new Set(changeReasonOptions.map((option) => option.value));

const OUTCOMES = {
    APPROVED: {
        status: "PUBLISHED" as CourseStatus,
        action: "Approved a course submission",
        past: "approved and published",
    },
    CHANGES_REQUESTED: {
        status: "NEEDS_CHANGES" as CourseStatus,
        action: "Requested changes on a course",
        past: "sent back to the instructor",
    },
    REJECTED: {
        status: "REJECTED" as CourseStatus,
        action: "Rejected a course submission",
        past: "rejected",
    },
} satisfies Record<
    SubmissionDecision,
    { status: CourseStatus; action: string; past: string }
>;

async function decide(
    courseId: string,
    decision: SubmissionDecision,
    extra: { changeReasons?: ChangeReason[]; noteToInstructor?: string } = {},
): Promise<AdminCoursesResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") return DENIED;

    if (typeof courseId !== "string" || courseId.length === 0) {
        return { ok: false, message: "That course could not be found." };
    }

    const course = await db.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            instructor: { select: { userId: true } },
            submissions: {
                orderBy: { submittedAt: "desc" },
                take: 1,
                select: { id: true },
            },
        },
    });

    if (!course)
        return { ok: false, message: "That course could not be found." };

    if (course.status !== "IN_REVIEW") {
        return {
            ok: false,
            message: `${course.title} is no longer awaiting review — reload to see where it stands.`,
        };
    }

    const submissionId = course.submissions[0]?.id;
    if (!submissionId) {
        return {
            ok: false,
            message: `${course.title} has no submission on file to decide on.`,
        };
    }

    const outcome = OUTCOMES[decision];
    const now = new Date();

    await db.$transaction([
        db.course.update({
            where: { id: course.id },
            data:
                decision === "APPROVED"
                    ? { status: outcome.status, publishedAt: now }
                    : { status: outcome.status },
        }),
        db.courseSubmission.update({
            where: { id: submissionId },
            data: {
                decision,
                reviewedById: session.user.id,
                reviewedAt: now,
                changeReasons: extra.changeReasons ?? [],
                noteToInstructor: extra.noteToInstructor ?? null,
            },
        }),
        db.auditLog.create({
            data: {
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role ?? null,
                action: outcome.action,
                targetType: "course",
                targetId: course.id,
                targetLabel: course.title,
                category: "COURSES",
            },
        }),
    ]);

    await notifyCourseDecision({
        instructorUserId: course.instructor?.userId ?? null,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        outcome: decision,
        note: extra.noteToInstructor ?? null,
    });

    revalidatePath("/dashboard/admin", "layout");

    return { ok: true, message: `${course.title} was ${outcome.past}` };
}

export async function approveCourse(
    courseId: string,
): Promise<AdminCoursesResult> {
    return decide(courseId, "APPROVED");
}

export async function requestCourseChanges(
    courseId: string,
    input: { reasons: string[]; note: string },
): Promise<AdminCoursesResult> {
    const reasons = [
        ...new Set(
            (Array.isArray(input?.reasons) ? input.reasons : []).filter(
                (reason): reason is ChangeReason =>
                    reasonValues.has(reason as ChangeReason),
            ),
        ),
    ];
    const note = (input?.note ?? "").trim().slice(0, NOTE_MAX_LENGTH);

    return decide(courseId, "CHANGES_REQUESTED", {
        changeReasons: reasons,
        noteToInstructor: note || undefined,
    });
}

export async function rejectCourse(
    courseId: string,
): Promise<AdminCoursesResult> {
    return decide(courseId, "REJECTED");
}
