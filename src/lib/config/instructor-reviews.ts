import { reportReasonBadge } from "@/lib/config/admin-reviews";
import type { ReportReason } from "@/generated/prisma/client";
import type { ReviewsQuery } from "@/lib/instructor-reviews";

export const REVIEWS_PAGE_SIZE = 4;

export const REVIEW_REPLY_MAX = 2000;

export const REPORT_NOTE_MAX = 1000;

export const RATING_BY_COURSE_LIMIT = 5;

export const RATING_TREND_DAYS = 90;

export const REVIEWS_LAYOUT_PATH = "/dashboard/instructor";

export const reviewsCopy = {
    title: "Reviews",
    description:
        "What Learners Say About Your Teaching, Across Every Course You Own.",
    allCourses: "All Courses",
    reset: "Reset",
    resetUnavailable: "Nothing Is Filtered Yet.",
    byCourse: "Rating By Course",
    summary: (reviews: number, courses: number) =>
        `Instructor Rating · ${reviews.toLocaleString("en-US")} ${
            reviews === 1 ? "Review" : "Reviews"
        } Across ${courses.toLocaleString("en-US")} ${
            courses === 1 ? "Course" : "Courses"
        }`,
    trend: (delta: number) =>
        `${delta > 0 ? "+" : ""}${delta.toFixed(1)} Vs Last Quarter`,
    reviewsOn: (count: number) =>
        `${count.toLocaleString("en-US")} ${count === 1 ? "Review" : "Reviews"}`,
    rated: (rating: number) => `Rated ${rating} Out Of 5`,
    reply: "Reply",
    replied: "You Replied",
    report: "Report",
    reportPending: "This Review Is Already Awaiting Moderation.",
    instructor: "Instructor",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${total === 1 ? "Review" : "Reviews"}`,
    noMatches: "No Review Matches This Filter.",
    empty: {
        title: "No Reviews Yet",
        description:
            "Every Rating A Learner Leaves On One Of Your Courses Appears Here, With The Reply You Gave It.",
    },
    noCourses: "Nothing Has Been Rated Yet.",
} as const;

export const replyDialogCopy = {
    title: "Reply To This Review",
    description: (name: string) =>
        `Your Reply Appears Under ${name}'s Review, On The Course Page And Here. Everyone Who Can Read The Review Can Read It.`,
    placeholder: "Thanks For The Detailed Feedback — …",
    submit: "Post Reply",
} as const;

export const reportDialogCopy = {
    title: "Report This Review",
    description:
        "A Moderator Reads Every Report. Reviews Are Never Removed For Being Critical — Only For Breaking The Guidelines.",
    reasonHeading: "What Is Wrong With It?",
    noteHeading: "Anything Else? (Optional)",
    notePlaceholder: "Add Anything A Moderator Would Need To Know.",
    submit: "Send Report",
} as const;

export type ReviewsTab = "all" | "5" | "4" | "3-below";

export const reviewsTabs: {
    value: ReviewsTab;
    label: string;
    star: boolean;
    after?: string;
}[] = [
    { value: "all", label: "All Ratings", star: false },
    { value: "5", label: "5", star: true },
    { value: "4", label: "4", star: true },
    { value: "3-below", label: "3", star: true, after: "& Below" },
];

export const reviewsTabValues = new Set<string>(
    reviewsTabs.map((tab) => tab.value),
);

export function isReviewsFiltered(query: ReviewsQuery): boolean {
    return query.tab !== "all" || query.courseId !== null;
}

export const reportReasonOptions: { value: ReportReason; label: string }[] = (
    ["SPAM", "ABUSIVE", "SPOILERS", "COPYRIGHT", "OTHER"] as const
).map((value) => ({ value, label: reportReasonBadge(value).label }));

export const reportReasonValues = new Set<string>(
    reportReasonOptions.map((option) => option.value),
);
