import type { CoursesQuery, CoursesTab } from "@/lib/admin/courses";
import type { ChangeReason, CourseStatus } from "@/generated/prisma/client";

export const COURSES_PAGE_SIZE = 6;

export const adminCoursesCopy = {
    title: "Courses",
    description:
        "Approve Submissions, Request Changes, And Manage The Live Catalog.",
    emptyTitle: "Nothing Here",
    emptyDescription:
        "No Course Has This Status Right Now. Try A Different Filter.",
    clearFilters: "Show All Courses",
    approve: "Approve",
    requestChanges: "Request Changes",
    view: "View",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${total === 1 ? "Course" : "Courses"}`,
} as const;

export const courseTabs: { value: CoursesTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "in-review", label: "In Review" },
    { value: "needs-changes", label: "Needs Changes" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
];

export function isCoursesFiltered(query: CoursesQuery): boolean {
    return query.tab !== "all";
}

export function awaitsDecision(status: CourseStatus): boolean {
    return status === "IN_REVIEW";
}

export const changeReasonOptions: { value: ChangeReason; label: string }[] = [
    { value: "AUDIO_VIDEO_QUALITY", label: "Audio Or Video Quality" },
    { value: "INCOMPLETE_CURRICULUM", label: "Incomplete Curriculum" },
    { value: "MISSING_QUIZ_OR_PROJECT", label: "Missing Quiz Or Project" },
    { value: "CONTENT_ACCURACY", label: "Content Accuracy" },
    { value: "COPYRIGHT_CONCERN", label: "Copyright Concern" },
];

export const changeReasonLabels: Record<ChangeReason, string> =
    Object.fromEntries(
        changeReasonOptions.map((option) => [option.value, option.label]),
    ) as Record<ChangeReason, string>;

export const requestChangesCopy = {
    title: "Request Changes",
    description: (course: string, instructor: string) =>
        `${course} Goes Back To ${instructor} As A Draft. They Can Resubmit Once Addressed.`,
    reasonsHeading: "What Needs To Change?",
    noteHeading: "Notes For The Instructor",
    notePlaceholder: "Be Specific — What Should They Fix Before Resubmitting?",
    submit: "Send Back To Instructor",
} as const;

export const NOTE_MAX_LENGTH = 1000;

export const courseViewCopy = {
    back: "Back To Courses",
    checklistHeading: "Submission Checklist",
    checklistEmpty:
        "This Course Has Not Been Through Review, So There Is No Checklist To Show.",
    curriculumHeading: "Curriculum Preview",
    curriculumEmpty: "This Course Has No Lessons Yet.",
    approve: "Approve & Publish",
    requestChanges: "Request Changes",
    reject: "Reject",
    decisionHeading: "Last Decision",
    decisionLabels: {
        APPROVED: "Approved",
        CHANGES_REQUESTED: "Changes Requested",
        REJECTED: "Rejected",
    } as Record<string, string>,
} as const;
