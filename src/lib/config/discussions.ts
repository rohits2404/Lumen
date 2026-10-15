import { userRoleBadge } from "@/lib/config/admin-users";

export type DiscussionAudience = "LEARNER" | "INSTRUCTOR";

export type DiscussionScope = "all" | "mine" | "unanswered" | "reported";

export const discussionScopes: { value: DiscussionScope; label: string }[] = [
    { value: "all", label: "All" },
    { value: "mine", label: "Mine" },
    { value: "unanswered", label: "Unanswered" },
];

export const reportedScope: { value: DiscussionScope; label: string } = {
    value: "reported",
    label: "Reported",
};

export const discussionScopeValues = new Set<string>(
    [...discussionScopes, reportedScope].map((entry) => entry.value),
);

export const DISCUSSIONS_PAGE_SIZE = 5;

export const DISCUSSION_TITLE_MAX = 140;
export const DISCUSSION_BODY_MAX = 4000;

export function authorRoleBadge(role: string | null | undefined) {
    return userRoleBadge(role);
}

export const discussionStatAccents = [
    "bg-info/10 text-info",
    "bg-role-instructor/10 text-role-instructor",
    "bg-warning/10 text-warning",
    "bg-success/10 text-success",
] as const;

export const discussionsCopy = {
    title: "Discussions",
    allTopics: "All Topics",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${total === 1 ? "Discussion" : "Discussions"}`,
    pinned: "Pinned",
    noMatches: "No Discussions Match This Filter.",
} as const;

export const discussionsLead: Record<DiscussionAudience, string> = {
    INSTRUCTOR:
        "Topics You Run For Your Cohorts. Pin, Moderate, And Keep Conversations On Track.",
    LEARNER:
        "Announcements And Topics From Your Instructors. Jump Into The Conversation.",
};

export const learnerNote = "Instructors Post Topics · You Can Reply";

export const instructorActions = {
    announce: "Announce",
    newDiscussion: "New Discussion",
} as const;

export const discussionStatLabels = {
    activeThreads: "Active Threads",
    repliesThisMonth: "Replies This Month",
    awaitingReply: "Awaiting Your Reply",
    participants: "Participants",
} as const;

export const moderationBanner = {
    title: (count: number) =>
        `${count} ${count === 1 ? "Thread Needs" : "Threads Need"} Moderation`,
    description: "Reported By Learners In The Topics You Moderate.",
    action: "Review",
} as const;

export const emptyDiscussions: Record<
    DiscussionAudience,
    { title: string; description: string }
> = {
    INSTRUCTOR: {
        title: "No Discussions Yet",
        description:
            "Start A Thread And It Will Appear Here For Everyone In Your Cohorts.",
    },
    LEARNER: {
        title: "No Discussions Yet",
        description:
            "When Your Instructors Post A Topic It Will Show Up Here, And You Can Reply.",
    },
};

export const newDiscussionCopy = {
    title: "New Discussion",
    announceTitle: "New Announcement",
    description:
        "Posts Appear In The Topic You Choose. Everyone Who Can See The Topic Can Reply.",
    announceDescription:
        "Announcements Go To The Announcements Topic, Where Every Learner Can See Them.",
    topic: "Topic",
    topicPlaceholder: "Choose A Topic",
    discussionTitle: "Title",
    titlePlaceholder: "What Is This About?",
    body: "Message",
    bodyPlaceholder: "Share The Details…",
    tags: "Tags",
    tagsPlaceholder: "Comma Separated, E.g. Illustration, Week 3",
    submit: "Post Discussion",
    announceSubmit: "Post Announcement",
} as const;

export const discussionsHref: Record<DiscussionAudience, string> = {
    LEARNER: "/dashboard/discussions",
    INSTRUCTOR: "/dashboard/instructor/discussions",
};

export const discussionsLayoutPath: Record<DiscussionAudience, string> = {
    LEARNER: "/dashboard",
    INSTRUCTOR: "/dashboard/instructor",
};

export const threadCopy = {
    back: "Back To Discussions",
    repliesHeading: "Replies",
    placeholder: "Write A Reply...",
    locked: "This Thread Is Locked.",
    reply: "Reply",
    replies: (count: number) => `${count} ${count === 1 ? "Reply" : "Replies"}`,
    notFound: "That Discussion Isn't Available.",
} as const;
