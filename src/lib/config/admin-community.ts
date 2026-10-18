import {
    InfoIcon,
    MessageSquareIcon,
    MessagesSquareIcon,
    UsersRoundIcon,
    type LucideIcon,
} from "lucide-react";

import type { TopicVisibility } from "@/generated/prisma/client";

export const MODERATORS_PAGE_SIZE = 8;

export const TOPIC_NAME_MAX_LENGTH = 60;
export const TOPIC_DESCRIPTION_MAX_LENGTH = 200;

export const adminCommunityCopy = {
    title: "Community",
    description:
        "Create Topics, Set Who Can Post, And Appoint Moderators To Keep Them Healthy.",
    newTopic: "New Topic",
    topicsHeading: "Topics",
    moderatorsHeading: "Moderators",
    moderatorsLead: "People With Elevated Permissions In One Or More Topics.",
    manageModerators: "Moderators",
    edit: "Edit",
    topicsEmptyTitle: "No Topics Yet",
    topicsEmptyDescription:
        "Create The First Topic And Learners Will See It As A Filter On Discussions.",
    moderatorsEmptyTitle: "No Moderators Yet",
    moderatorsEmptyDescription:
        "Appoint One From A Topic's Moderators Dialog And They Will Appear Here.",
    rowMenu: {
        label: (topic: string) => `Actions For ${topic}`,
        edit: "Edit Topic",
        moderators: "Manage Moderators",
        delete: "Delete Topic",
        deleteBlocked: (threads: number) =>
            `${threads.toLocaleString("en-US")} ${
                threads === 1 ? "Thread Is" : "Threads Are"
            } Filed Under This Topic.`,
    },
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${
            total === 1 ? "Moderator" : "Moderators"
        }`,
} as const;

export const communityStatCards: {
    key: "topics" | "threads" | "moderators" | "reportedItems";
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "topics", label: "Topics", icon: MessagesSquareIcon },
    { key: "threads", label: "Threads", icon: MessageSquareIcon },
    { key: "moderators", label: "Moderators", icon: UsersRoundIcon },
    { key: "reportedItems", label: "Reported Items", icon: InfoIcon },
];

export type Pill = { label: string; className: string };

export function postingPill(learnersCanStartThreads: boolean): Pill {
    return learnersCanStartThreads
        ? { label: "Open Posting", className: "bg-success/10 text-success" }
        : { label: "Staff Post Only", className: "bg-warning/10 text-warning" };
}

export const topicVisibilityLabels: Record<TopicVisibility, string> = {
    EVERYONE: "Everyone",
    ENROLLED_ONLY: "Enrolled Only",
    STAFF_ONLY: "Staff Only",
};

export const topicVisibilityOptions: {
    value: TopicVisibility;
    label: string;
    description: string;
}[] = [
    {
        value: "EVERYONE",
        label: "Everyone",
        description: "Any Signed-In Learner Can Read And Post.",
    },
    {
        value: "ENROLLED_ONLY",
        label: "Enrolled Only",
        description: "Restricted To Learners In A Linked Course.",
    },
    {
        value: "STAFF_ONLY",
        label: "Staff Only",
        description: "Instructors And Admins. Learners Cannot See It.",
    },
];

export function isTopicVisibility(value: unknown): value is TopicVisibility {
    return (
        value === "EVERYONE" ||
        value === "ENROLLED_ONLY" ||
        value === "STAFF_ONLY"
    );
}

export const MODERATOR_PERMISSIONS = [
    "canPin",
    "canLock",
    "canDelete",
    "canSuspend",
] as const;

export type ModeratorPermission = (typeof MODERATOR_PERMISSIONS)[number];

export type ModeratorPermissions = Record<ModeratorPermission, boolean>;

export const moderatorPermissionRows: {
    key: ModeratorPermission;
    title: string;
    description: string;
    short: string;
}[] = [
    {
        key: "canPin",
        title: "Pin And Feature Threads",
        description: "Keep Important Posts At The Top.",
        short: "Pin",
    },
    {
        key: "canLock",
        title: "Lock And Close Threads",
        description: "Stop New Replies On A Conversation.",
        short: "Lock",
    },
    {
        key: "canDelete",
        title: "Delete Posts And Replies",
        description: "Remove Content That Breaks The Rules.",
        short: "Delete",
    },
    {
        key: "canSuspend",
        title: "Suspend Participants",
        description: "Temporarily Block Someone From Posting.",
        short: "Suspend",
    },
];

export function permissionSummary(permissions: ModeratorPermissions): string {
    const granted = moderatorPermissionRows.filter(
        (row) => permissions[row.key],
    );
    if (granted.length === moderatorPermissionRows.length)
        return "Full control";
    if (granted.length === 0) return "No permissions";
    const words = granted.map((row) => row.short);
    return (
        words[0]!.charAt(0).toUpperCase() +
        words[0]!.slice(1) +
        (words.length > 1 ? `, ${words.slice(1).join(", ")}` : "")
    );
}

export const topicDialogCopy = {
    createTitle: "Create Community Topic",
    editTitle: "Edit Community Topic",
    description:
        "Topics Group Related Threads. Learners See Them As Filters On The Discussions Page.",
    nameLabel: "Topic Name",
    namePlaceholder: "E.g. Career Advice",
    descriptionLabel: "Description",
    descriptionPlaceholder: "What Belongs In This Topic?",
    accentLabel: "Accent Colour",
    visibilityLabel: "Who Can See It",
    threadsTitle: "Learners Can Start Threads",
    threadsDescription: "Turn Off For Announcement-Style Topics.",
    approvalTitle: "Require Moderator Approval",
    approvalDescription:
        "New Threads Are Held Until A Moderator Approves Them.",
    createSubmit: "Create Topic",
    editSubmit: "Save Topic",
} as const;

export const moderatorsDialogCopy = {
    title: "Moderators",
    description: (topic: string) =>
        `Managing ${topic}. Moderators Act Only Inside This Topic.`,
    currentHeading: "Current Moderators",
    currentEmpty: "Nobody Moderates This Topic Yet.",
    permissionsHeading: "Permissions",
    permissionsLead: (name: string) => `Applies To ${name} In This Topic.`,
    permissionsNoSelection: "Select A Moderator Above To Set What They Can Do.",
    addHeading: "Add A Moderator",
    searchPlaceholder: "Search Members...",
    searchEmpty: "No Member Matches That Search.",
    add: "Add",
    remove: "Remove",
    submit: "Save Changes",
    candidateMeta: (role: string | null, courses: number) =>
        role === "instructor"
            ? `Instructor · ${courses} ${courses === 1 ? "Course" : "Courses"}`
            : role === "admin"
              ? "Admin"
              : "Student",
} as const;

export const deleteTopicCopy = {
    title: "Delete Topic",
    description: (name: string) =>
        `${name} Will Be Removed From The Discussions Filters. This Cannot Be Undone.`,
    confirm: "Delete Topic",
} as const;
