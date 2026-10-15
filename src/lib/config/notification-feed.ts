import {
    AwardIcon,
    BellIcon,
    BookOpenTextIcon,
    CreditCardIcon,
    GraduationCapIcon,
    MessageCircleIcon,
    MessagesSquareIcon,
    ShieldCheckIcon,
    UsersRoundIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

import type {
    NotificationAudience,
    NotificationCategory,
} from "@/generated/prisma/client";

const categoryStyles: Record<
    NotificationCategory,
    { tile: string; dot: string; pill: string }
> = {
    COURSE: {
        tile: "bg-accent-2/10 text-accent-2",
        dot: "bg-accent-2",
        pill: "bg-accent-2/10 text-accent-2",
    },
    MESSAGE: {
        tile: "bg-success/10 text-success",
        dot: "bg-success",
        pill: "bg-success/10 text-success",
    },
    COMMUNITY: {
        tile: "bg-accent-1/10 text-accent-1",
        dot: "bg-accent-1",
        pill: "bg-accent-1/10 text-accent-1",
    },
    CERTIFICATE: {
        tile: "bg-star/10 text-star",
        dot: "bg-star",
        pill: "bg-star/10 text-star",
    },
    BILLING: {
        tile: "bg-accent-3/10 text-accent-3",
        dot: "bg-accent-3",
        pill: "bg-accent-3/10 text-accent-3",
    },
    MEMBERS: {
        tile: "bg-role-instructor/10 text-role-instructor",
        dot: "bg-role-instructor",
        pill: "bg-role-instructor/10 text-role-instructor",
    },
    SECURITY: {
        tile: "bg-warning/10 text-warning",
        dot: "bg-warning",
        pill: "bg-warning/10 text-warning",
    },
};

export type FeedCategory = {
    value: NotificationCategory;
    label: string;
    icon: LucideIcon;
    tile: string;
    dot: string;
    pill: string;
};

function category(
    value: NotificationCategory,
    label: string,
    icon: LucideIcon,
): FeedCategory {
    return { value, label, icon, ...categoryStyles[value] };
}

export const feedCategories: Record<NotificationAudience, FeedCategory[]> = {
    LEARNER: [
        category("COURSE", "Course", BookOpenTextIcon),
        category("MESSAGE", "Message", MessageCircleIcon),
        category("COMMUNITY", "Community", MessagesSquareIcon),
        category("CERTIFICATE", "Certificate", AwardIcon),
        category("BILLING", "Billing", CreditCardIcon),
    ],
    INSTRUCTOR: [
        category("COURSE", "Courses", BookOpenTextIcon),
        category("MEMBERS", "Students", GraduationCapIcon),
        category("MESSAGE", "Messages", MessageCircleIcon),
        category("COMMUNITY", "Community", MessagesSquareIcon),
        category("BILLING", "Earnings", WalletIcon),
    ],
    ADMIN: [
        category("MEMBERS", "Members", UsersRoundIcon),
        category("COURSE", "Courses", BookOpenTextIcon),
        category("COMMUNITY", "Community", MessagesSquareIcon),
        category("BILLING", "Billing", CreditCardIcon),
        category("SECURITY", "Security", ShieldCheckIcon),
    ],
};

export const ALL_TYPES_ICON: LucideIcon = BellIcon;

export function feedCategoryValues(audience: NotificationAudience) {
    return new Set<string>(
        feedCategories[audience].map((entry) => entry.value),
    );
}

export function feedCategory(
    audience: NotificationAudience,
    value: NotificationCategory,
): FeedCategory {
    return (
        feedCategories[audience].find((entry) => entry.value === value) ?? {
            value,
            label: "Activity",
            icon: BellIcon,
            tile: "bg-hover text-muted-foreground",
            dot: "bg-muted-foreground",
            pill: "bg-hover text-muted-foreground",
        }
    );
}

export const feedStatuses = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
] as const;

export type FeedStatus = (typeof feedStatuses)[number]["value"];

export const feedStatusValues = new Set<string>(
    feedStatuses.map((status) => status.value),
);

export const FEED_PAGE_SIZE = 20;

export const FEED_SEARCH_MAX = 100;

export const feedSettingsHref: Record<NotificationAudience, string> = {
    LEARNER: "/dashboard/settings/notifications",
    INSTRUCTOR: "/dashboard/instructor/settings/notifications",
    ADMIN: "/dashboard/admin/settings/notifications",
};

export const feedLead: Record<NotificationAudience, string> = {
    LEARNER: "Stay Up To Date With What's Happening Across Your Courses.",
    INSTRUCTOR: "Stay Up To Date With What's Happening Across Your Courses.",
    ADMIN: "Stay Up To Date With What's Happening Across The Platform.",
};

export const feedEmpty: Record<NotificationAudience, string> = {
    LEARNER:
        "New Lessons, Replies, Certificates And Receipts Will Appear Here As They Happen.",
    INSTRUCTOR:
        "Enrolments, Reviews, Questions And Payouts Will Appear Here As They Happen.",
    ADMIN: "Platform Activity — Applications, Submissions, Reports And Payouts — Will Appear Here As It Happens.",
};

export const feedCopy = {
    title: "Notifications",
    unread: (count: number) => `${count} Unread`,
    markAllRead: "Mark All As Read",
    settings: "Notification Settings",
    searchPlaceholder: "Search Notifications...",
    categoriesHeading: "Categories",
    allTypes: "All Types",
    listView: "List View",
    gridView: "Grid View",
    showing: (shown: number, total: number) =>
        `Showing ${shown} Of ${total} Notification${total === 1 ? "" : "(s)"}`,
    emptyTitle: "You're All Caught Up",
    filteredEmptyTitle: "No Notifications Match",
    filteredEmptyDescription:
        "Try A Different Category, Or Clear The Search To See Everything.",
    markRead: "Mark As Read",
    markUnread: "Mark As Unread",
    accept: "Accept",
    decline: "Decline",
    accepted: "Accepted",
    declined: "Declined",
} as const;
