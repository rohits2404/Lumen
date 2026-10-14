import {
    BookOpenTextIcon,
    BrainCircuitIcon,
    BriefcaseIcon,
    CircleCheckIcon,
    Code2Icon,
    LayoutGridIcon,
    LineChartIcon,
    MegaphoneIcon,
    PaletteIcon,
    PresentationIcon,
    SproutIcon,
    StarIcon,
    UsersRoundIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

import type { AttentionFacts } from "@/lib/admin/overview";

export const adminOverviewCopy = {
    title: "Platform Overview",
    modeBadge: "Admin mode",
    attentionHeading: "Needs your attention",
    topCoursesHeading: "Top courses platform-wide",
    attentionEmpty: "Nothing is waiting on you right now.",
    topCoursesEmpty: "No courses are live yet.",
} as const;

export type PlatformStatKey = "users" | "courses" | "revenue" | "uptime";

export type PlatformStatFormat = "count" | "currency" | "percent";

export const platformStatCards: {
    key: PlatformStatKey;
    label: string;
    icon: LucideIcon;
    format: PlatformStatFormat;
    deltaFormat: "relative" | "points";
}[] = [
    {
        key: "users",
        label: "Total Users",
        icon: UsersRoundIcon,
        format: "count",
        deltaFormat: "relative",
    },
    {
        key: "courses",
        label: "Live Courses",
        icon: BookOpenTextIcon,
        format: "count",
        deltaFormat: "relative",
    },
    {
        key: "revenue",
        label: "Gross Revenue",
        icon: WalletIcon,
        format: "currency",
        deltaFormat: "relative",
    },
    {
        key: "uptime",
        label: "Uptime",
        icon: CircleCheckIcon,
        format: "percent",
        deltaFormat: "points",
    },
];

export type AttentionTone = "info" | "violet" | "star" | "danger";

export const attentionToneClasses: Record<AttentionTone, string> = {
    info: "bg-accent-2/10 text-accent-2",
    violet: "bg-accent-1/10 text-accent-1",
    star: "bg-star/10 text-star",
    danger: "bg-destructive/10 text-destructive",
};

export type SubtitleFormatters = {
    relative: (date: Date) => string;
    shortDate: (date: Date) => string;
};

export type AttentionQueue = {
    key: keyof AttentionFacts;
    icon: LucideIcon;
    tone: AttentionTone;
    href: string;
    built: boolean;
    describe: (
        facts: AttentionFacts,
        format: SubtitleFormatters,
    ) => { count: number; title: string; subtitle: string | null };
};

export const attentionQueues: AttentionQueue[] = [
    {
        key: "coursesAwaitingReview",
        icon: BookOpenTextIcon,
        tone: "info",
        href: "/dashboard/admin/courses?tab=in-review",
        built: true,
        describe: ({ coursesAwaitingReview: queue }, format) => ({
            count: queue.count,
            title: `${queue.count} ${
                queue.count === 1 ? "Course" : "Courses"
            } Awaiting Review`,
            subtitle: queue.oldestSubmittedAt
                ? `Oldest Submitted ${format.relative(queue.oldestSubmittedAt)}`
                : null,
        }),
    },

    {
        key: "instructorApplications",
        icon: PresentationIcon,
        tone: "violet",
        href: "/dashboard/admin/users?tab=pending-instructors",
        built: true,
        describe: ({ instructorApplications: queue }, format) => ({
            count: queue.count,
            title: `${queue.count} Instructor Application${
                queue.count === 1 ? "" : "s"
            }`,
            subtitle: queue.allThisWeek
                ? "All Submitted This Week"
                : queue.oldestCreatedAt
                  ? `Oldest Submitted ${format.relative(queue.oldestCreatedAt)}`
                  : null,
        }),
    },

    {
        key: "reportedReviews",
        icon: StarIcon,
        tone: "star",
        href: "/dashboard/admin/reviews",
        built: true,
        describe: ({ reportedReviews: queue }) => ({
            count: queue.count,
            title: `${queue.count} Reported Review${queue.count === 1 ? "" : "s"}`,
            subtitle:
                queue.count === 0
                    ? null
                    : queue.byOthers === 0
                      ? "Flagged By Instructors"
                      : queue.byInstructors === 0
                        ? "Flagged By Learners"
                        : "Flagged By Instructors And Learners",
        }),
    },

    {
        key: "failedPayouts",
        icon: WalletIcon,
        tone: "danger",
        href: "/dashboard/admin/reports",
        built: true,
        describe: ({ failedPayouts: queue }, format) => ({
            count: queue.count,
            title: `${queue.count} Failed Payout${queue.count === 1 ? "" : "s"}`,
            subtitle: queue.retryScheduledFor
                ? `Retry Scheduled For ${format.shortDate(queue.retryScheduledFor)}`
                : "No Retry Run Scheduled",
        }),
    },
];

export const categoryGradients: Record<string, string> = {
    blue: "from-accent-2 to-accent-3",
    violet: "from-accent-1 to-accent-2",
    cyan: "from-accent-3 to-accent-2",
    green: "from-success to-accent-3",
    amber: "from-warning to-star",
    red: "from-destructive to-warning",
};

export const FALLBACK_CATEGORY_GRADIENT = "from-accent-1 to-accent-3";

export const categoryIcons: Record<string, LucideIcon> = {
    development: Code2Icon,
    design: PaletteIcon,
    "data-ai": BrainCircuitIcon,
    business: BriefcaseIcon,
    marketing: MegaphoneIcon,
    "personal-development": SproutIcon,
    finance: LineChartIcon,
};

export const FALLBACK_CATEGORY_ICON = LayoutGridIcon;
