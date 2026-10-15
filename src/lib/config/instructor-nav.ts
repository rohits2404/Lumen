import {
    BellIcon,
    BookOpenTextIcon,
    ChartLineIcon,
    CirclePlusIcon,
    LayoutDashboardIcon,
    LifeBuoyIcon,
    MailIcon,
    MessageCircleQuestionMarkIcon,
    MessagesSquareIcon,
    SettingsIcon,
    StarIcon,
    TicketPercentIcon,
    UsersRoundIcon,
    WalletIcon,
} from "lucide-react";

import type {
    CommandPaletteItem,
    DashboardNavGroup,
} from "@/lib/config/dashboard";
import { instructorSettingsNav } from "@/lib/config/instructor-settings";

export const instructorNav: DashboardNavGroup[] = [
    {
        title: "Teach",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard/instructor",
                icon: LayoutDashboardIcon,
                built: true,
            },
            {
                title: "My Courses",
                href: "/dashboard/instructor/courses",
                icon: BookOpenTextIcon,
                built: true,
            },
            {
                title: "Create Course",
                href: "/dashboard/instructor/courses/new",
                icon: CirclePlusIcon,
                built: true,
                tag: "New",
            },
        ],
    },
    {
        title: "Audience",
        items: [
            {
                title: "Students",
                href: "/dashboard/instructor/students",
                icon: UsersRoundIcon,
            },
            {
                title: "Reviews",
                href: "/dashboard/instructor/reviews",
                icon: StarIcon,
                built: true,
            },
            {
                title: "Q&A",
                href: "/dashboard/instructor/qa",
                icon: MessageCircleQuestionMarkIcon,
                built: true,
            },
            {
                title: "Discussions",
                href: "/dashboard/instructor/discussions",
                icon: MessagesSquareIcon,
                built: true,
            },
        ],
    },
    {
        title: "Business",
        items: [
            {
                title: "Analytics",
                href: "/dashboard/instructor/analytics",
                icon: ChartLineIcon,
                built: true,
            },
            {
                title: "Revenue & Payouts",
                href: "/dashboard/instructor/revenue",
                icon: WalletIcon,
                built: true,
            },
            {
                title: "Coupons",
                href: "/dashboard/instructor/coupons",
                icon: TicketPercentIcon,
                built: true,
            },
        ],
    },
    {
        title: "General",
        items: [
            {
                title: "Messages",
                href: "/dashboard/instructor/messages",
                icon: MailIcon,
                built: true,
            },
            {
                title: "Notifications",
                href: "/dashboard/instructor/notifications",
                icon: BellIcon,
                built: true,
            },
            {
                title: "Settings",
                href: "/dashboard/instructor/settings",
                icon: SettingsIcon,
                built: true,
                items: instructorSettingsNav.map(({ title, href, built }) => ({
                    title,
                    href,
                    built,
                })),
            },
            {
                title: "Help Center",
                href: "/dashboard/instructor/help",
                icon: LifeBuoyIcon,
                built: true,
            },
        ],
    },
];

export function instructorNavCounts(
    unreadNotifications = 0,
    unreadMessages = 0,
    unansweredQuestions = 0,
): Record<string, number> {
    return {
        ...(unreadNotifications > 0
            ? { "/dashboard/instructor/notifications": unreadNotifications }
            : {}),
        ...(unreadMessages > 0
            ? { "/dashboard/instructor/messages": unreadMessages }
            : {}),
        ...(unansweredQuestions > 0
            ? { "/dashboard/instructor/qa": unansweredQuestions }
            : {}),
    };
}

export const instructorCommandPaletteGroups: {
    title: string;
    items: CommandPaletteItem[];
}[] = [
    {
        title: "Go To",
        items: instructorNav
            .flatMap((group) => group.items)
            .filter((item) => item.built ?? true)
            .map(({ title, href, icon }) => ({ title, href, icon })),
    },
];

export const INSTRUCTOR_HOME = "/dashboard/instructor";

export const instructorOverviewCopy = {
    title: "Overview",
    modeBadge: "Instructor Mode",
} as const;
