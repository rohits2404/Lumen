import type { ReportReason } from "@/generated/prisma/client";

export const REPORTED_REVIEWS_PAGE_SIZE = 8;

export const adminReviewsCopy = {
    title: "Reported Reviews",
    description:
        "Reviews Are Never Removed For Being Critical — Only For Breaking The Guidelines.",
    remove: "Remove Review",
    keep: "Keep & Dismiss",
    hide: "Hide Pending Appeal",
    suspend: "Suspend Reviewer",
    message: "Message Author",
    suspendUnavailable: "This Account Is Already Suspended.",
    on: (course: string) => `On ${course}`,
    emptyTitle: "Nothing To Moderate",
    emptyDescription:
        "No Review Has An Open Report Against It. Reports Filed By Instructors And Learners Land Here.",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} Reported ${
            total === 1 ? "Review" : "Reviews"
        }`,
} as const;

export type ReasonBadge = { label: string; className: string };

export function reportReasonBadge(reason: ReportReason): ReasonBadge {
    const className = "bg-destructive/10 text-destructive";
    switch (reason) {
        case "SPAM":
            return { label: "Spam / Promotional Link", className };
        case "ABUSIVE":
            return { label: "Abusive Language", className };
        case "SPOILERS":
            return { label: "Contains Spoilers", className };
        case "COPYRIGHT":
            return { label: "Copyright Concern", className };
        default:
            return { label: "Other", className };
    }
}
