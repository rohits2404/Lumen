"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { setUserStatus } from "@/lib/actions/admin-users";
import type { ReportStatus, ReviewStatus } from "@/generated/prisma/client";

export type AdminReviewsResult = { ok: boolean; message: string };

const DENIED: AdminReviewsResult = {
    ok: false,
    message: "You Do Not Have Access To Review Moderation.",
};

const GONE: AdminReviewsResult = {
    ok: false,
    message: "That Report Has Already Been Dealt With — Reload The Queue.",
};

const OUTCOMES = {
    remove: {
        review: "REMOVED" as ReviewStatus,
        report: "REMOVED" as ReportStatus,
        action: "Removed A Reported Review",
        past: "Removed",
    },
    keep: {
        review: "VISIBLE" as ReviewStatus,
        report: "DISMISSED" as ReportStatus,
        action: "Dismissed A Review Report",
        past: "Kept — The Report Was Dismissed",
    },
    hide: {
        review: "HIDDEN_PENDING_APPEAL" as ReviewStatus,
        report: "HIDDEN_PENDING_APPEAL" as ReportStatus,
        action: "Hid A Review Pending Appeal",
        past: "Hidden While The Author Appeals",
    },
} as const;

type Decision = keyof typeof OUTCOMES;

function revalidateConsole() {
    revalidatePath("/dashboard/admin", "layout");
}

async function decide(
    reportId: string,
    decision: Decision,
): Promise<AdminReviewsResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") return DENIED;

    if (typeof reportId !== "string" || reportId.length === 0) return GONE;

    const report = await db.contentReport.findUnique({
        where: { id: reportId },
        select: { id: true, status: true, targetType: true, targetId: true },
    });

    if (!report || report.targetType !== "REVIEW" || report.status !== "OPEN") {
        return GONE;
    }

    const review = await db.courseReview.findUnique({
        where: { id: report.targetId },
        select: { id: true, course: { select: { title: true } } },
    });
    if (!review) return GONE;

    const outcome = OUTCOMES[decision];
    const now = new Date();

    await db.$transaction([
        db.courseReview.update({
            where: { id: review.id },
            data: {
                status: outcome.review,
                deletedAt: decision === "remove" ? now : null,
            },
        }),
        db.contentReport.update({
            where: { id: report.id },
            data: {
                status: outcome.report,
                resolvedById: session.user.id,
                resolvedAt: now,
            },
        }),
        db.auditLog.create({
            data: {
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role ?? null,
                action: outcome.action,
                targetType: "review",
                targetId: review.id,
                targetLabel: `Review on ${review.course.title}`,
                category: "COURSES",
            },
        }),
    ]);

    revalidateConsole();

    return {
        ok: true,
        message: `Review On ${review.course.title} ${outcome.past}`,
    };
}

export async function removeReportedReview(reportId: string) {
    return decide(reportId, "remove");
}

export async function keepReportedReview(reportId: string) {
    return decide(reportId, "keep");
}

export async function hideReportedReview(reportId: string) {
    return decide(reportId, "hide");
}

export async function suspendReviewer(
    reportId: string,
): Promise<AdminReviewsResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") return DENIED;

    if (typeof reportId !== "string" || reportId.length === 0) return GONE;

    const report = await db.contentReport.findUnique({
        where: { id: reportId },
        select: { status: true, targetType: true, targetId: true },
    });
    if (!report || report.targetType !== "REVIEW" || report.status !== "OPEN") {
        return GONE;
    }

    const review = await db.courseReview.findUnique({
        where: { id: report.targetId },
        select: { userId: true },
    });
    if (!review) return GONE;

    return setUserStatus([review.userId], "SUSPENDED");
}
