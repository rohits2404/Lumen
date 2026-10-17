export type QaTab = "all" | "unanswered" | "answered";

export const qaTabs: { value: QaTab; label: string }[] = [
    { value: "all", label: "All questions" },
    { value: "unanswered", label: "Unanswered" },
    { value: "answered", label: "Answered" },
];

export const qaTabValues = new Set<string>(qaTabs.map((tab) => tab.value));

export const QUESTIONS_PAGE_SIZE = 3;

export const QA_REPLY_MAX = 4000;
export const QA_THREAD_REPLY_LIMIT = 100;

export const qaStatusBadge = {
    answered: {
        label: "Answered By Instructor",
        className: "bg-success/10 text-success",
    },
    awaiting: {
        label: "Awaiting Reply",
        className: "bg-warning/10 text-warning",
    },
} as const;

export const qaCopy = {
    title: "Q&A",
    description: "Questions From Students Enrolled In Your Courses.",
    allCourses: "All courses",
    votes: "votes",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} of ${total} ${total === 1 ? "Question" : "Questions"}`,
    replies: (count: number) => `${count} ${count === 1 ? "Reply" : "Replies"}`,
    noMatches: "No Questions Match This Filter.",
    empty: {
        title: "No Questions Yet",
        description:
            "When a Student Asks a Question Inside One Of Your Lessons It Will Appear Here.",
    },
} as const;

export const qaThreadCopy = {
    back: "Back To All Questions",
    repliesHeading: "Replies",
    asked: (age: string) => `Asked ${age}`,
    placeholder: "Write a Reply...",
    submit: "Post Reply",
    readOnly: "You No Longer Teach This Course, So This Thread Is Read-Only.",
} as const;

export const QA_HREF = "/dashboard/instructor/qa";

export const QA_LAYOUT_PATH = "/dashboard/instructor";
