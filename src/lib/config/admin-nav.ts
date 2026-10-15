import {
    BellIcon,
    BookOpenTextIcon,
    ChartLineIcon,
    ChartNoAxesColumnIncreasingIcon,
    LayoutDashboardIcon,
    LayoutGridIcon,
    MessagesSquareIcon,
    SettingsIcon,
    ShieldCheckIcon,
    StarIcon,
    TicketPercentIcon,
    UserRoundIcon,
    UsersRoundIcon,
    type LucideIcon,
} from "lucide-react";

import type { AttentionFacts } from "@/lib/admin/overview";
import type {
    CommandPaletteItem,
    DashboardNavGroup,
} from "@/lib/config/dashboard";

export const adminNav: DashboardNavGroup[] = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard/admin",
                icon: LayoutDashboardIcon,
                built: true,
            },
            {
                title: "Reports",
                href: "/dashboard/admin/reports",
                icon: ChartLineIcon,
                built: true,
            },
            {
                title: "Audit Log",
                href: "/dashboard/admin/audit-log",
                icon: ChartNoAxesColumnIncreasingIcon,
                built: true,
            },
            {
                title: "Notifications",
                href: "/dashboard/admin/notifications",
                icon: BellIcon,
                built: true,
            },
        ],
    },
    {
        title: "People",
        items: [
            {
                title: "Users",
                href: "/dashboard/admin/users",
                icon: UsersRoundIcon,
                built: true,
            },
        ],
    },
    {
        title: "Content",
        items: [
            {
                title: "Courses",
                href: "/dashboard/admin/courses",
                icon: BookOpenTextIcon,
                built: true,
            },
            {
                title: "Categories",
                href: "/dashboard/admin/categories",
                icon: LayoutGridIcon,
                built: true,
            },
            {
                title: "Reviews",
                href: "/dashboard/admin/reviews",
                icon: StarIcon,
                built: true,
            },
            {
                title: "Community",
                href: "/dashboard/admin/community",
                icon: MessagesSquareIcon,
                built: true,
            },
        ],
    },
    {
        title: "Operations",
        items: [
            {
                title: "Promotions",
                href: "/dashboard/admin/promotions",
                icon: TicketPercentIcon,
                built: true,
            },
            {
                title: "Platform Settings",
                href: "/dashboard/admin/settings",
                icon: SettingsIcon,
                built: true,
                items: [
                    {
                        title: "Profile",
                        href: "/dashboard/admin/settings/profile",
                    },
                    {
                        title: "Account",
                        href: "/dashboard/admin/settings/account",
                    },
                    {
                        title: "Platform Controls",
                        href: "/dashboard/admin/settings/platform",
                    },
                    {
                        title: "Notifications",
                        href: "/dashboard/admin/settings/notifications",
                    },
                ],
            },
        ],
    },
];

export function adminNavCounts(
    facts: AttentionFacts,
    unreadNotifications = 0,
): Record<string, number> {
    return {
        "/dashboard/admin/users": facts.instructorApplications.count,
        "/dashboard/admin/courses": facts.coursesAwaitingReview.count,
        "/dashboard/admin/reviews": facts.reportedReviews.count,
        ...(unreadNotifications > 0
            ? { "/dashboard/admin/notifications": unreadNotifications }
            : {}),
    };
}

export const adminCommandPaletteGroups: {
    title: string;
    items: CommandPaletteItem[];
}[] = [
    {
        title: "Go To",
        items: adminNav
            .flatMap((group) => group.items)
            .filter((item) => item.built ?? true)
            .map(({ title, href, icon }) => ({ title, href, icon })),
    },
];

export const adminAccountMenu: {
    title: string;
    href: string;
    icon: LucideIcon;
}[] = [
    {
        title: "Profile",
        href: "/dashboard/admin/settings/profile",
        icon: UserRoundIcon,
    },
    {
        title: "Account",
        href: "/dashboard/admin/settings/account",
        icon: ShieldCheckIcon,
    },
];

export const EXIT_ADMIN_HREF = "/dashboard";
