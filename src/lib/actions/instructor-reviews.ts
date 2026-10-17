"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import {
    REPORT_NOTE_MAX,
    REVIEW_REPLY_MAX,
    REVIEWS_LAYOUT_PATH,
    reportReasonValues,
} from "@/lib/config/instructor-reviews";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import type { ReportReason } from "@/generated/prisma/client";

export type ReviewActionResult = { ok: boolean; message: string };

async function ownReview(userId: string, reviewId: string) {
    const profile = await getInstructorProfile(userId);
    if (!profile) return null;

    return db.courseReview.findFirst({
        where: {
            id: reviewId,
            deletedAt: null,
            status: "VISIBLE",
            course: { instructorId: profile.id },
        },
        select: {
            id: true,
            course: { select: { title: true } },
            reply: { select: { id: true } },
        },
    });
}

export async function replyToReview(
    reviewId: string,
    body: string,
): Promise<ReviewActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Reply." };

    const text = body.trim();
    if (!text) return { ok: false, message: "Write a Reply First." };
    if (text.length > REVIEW_REPLY_MAX) {
        return {
            ok: false,
            message: `Keep a Reply Under ${REVIEW_REPLY_MAX} Characters.`,
        };
    }

    const meId = session.user.id;
    const review = await ownReview(meId, reviewId);
    if (!review) return { ok: false, message: "That Review Isn't Available." };
    if (review.reply) {
        return {
            ok: false,
            message: "You Have Already Replied To This Review.",
        };
    }

    await db.courseReviewReply.create({
        data: { reviewId: review.id, authorId: meId, body: text },
    });

    revalidatePath(REVIEWS_LAYOUT_PATH, "layout");
    return { ok: true, message: "Reply Posted." };
}

export async function reportReview(
    reviewId: string,
    reason: string,
    note: string,
): Promise<ReviewActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Report a Review." };

    if (!reportReasonValues.has(reason)) {
        return { ok: false, message: "Pick a Reason First." };
    }

    const trimmed = note.trim().slice(0, REPORT_NOTE_MAX);
    const meId = session.user.id;
    const review = await ownReview(meId, reviewId);
    if (!review) return { ok: false, message: "That Review Isn't Available." };

    const open = await db.contentReport.findFirst({
        where: { targetType: "REVIEW", targetId: review.id, status: "OPEN" },
        select: { id: true },
    });
    if (open) {
        return {
            ok: false,
            message: "This Review Is Already Awaiting Moderation.",
        };
    }

    await db.$transaction([
        db.contentReport.create({
            data: {
                reporterId: meId,
                targetType: "REVIEW",
                targetId: review.id,
                targetLabel: `Review On ${review.course.title}`,
                reason: reason as ReportReason,
                note: trimmed === "" ? null : trimmed,
            },
        }),
        db.courseReview.update({
            where: { id: review.id },
            data: { reportCount: { increment: 1 } },
        }),
    ]);

    revalidatePath(REVIEWS_LAYOUT_PATH, "layout");
    return { ok: true, message: "Reported. A Moderator Will Take a Look." };
}
