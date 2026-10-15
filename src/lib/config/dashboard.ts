import {
    AwardIcon,
    BellIcon,
    CompassIcon,
    CreditCardIcon,
    GraduationCapIcon,
    HeartIcon,
    LayoutDashboardIcon,
    LifeBuoyIcon,
    MailIcon,
    PresentationIcon,
    MessagesSquareIcon,
    SettingsIcon,
    ShieldCheckIcon,
    UserRoundIcon,
    type LucideIcon,
} from "lucide-react";

import { settingsNav } from "@/lib/config/settings";

export type DashboardNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
    tag?: string;
    items?: { title: string; href: string; built?: boolean }[];
    built?: boolean;
};

export type DashboardNavGroup = {
    title: string;
    items: DashboardNavItem[];
};

export const dashboardNav: DashboardNavGroup[] = [
    {
        title: "Learn",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboardIcon,
            },
            {
                title: "Browse Courses",
                href: "/dashboard/courses",
                icon: CompassIcon,
            },
            {
                title: "My Learning",
                href: "/dashboard/learning",
                icon: GraduationCapIcon,
            },
            {
                title: "Wishlist",
                href: "/dashboard/wishlist",
                icon: HeartIcon,
            },
            {
                title: "Certificates",
                href: "/dashboard/certificates",
                icon: AwardIcon,
            },
        ],
    },
    {
        title: "Community",
        items: [
            {
                title: "Discussions",
                href: "/dashboard/discussions",
                icon: MessagesSquareIcon,
            },
            {
                title: "Messages",
                href: "/dashboard/messages",
                icon: MailIcon,
            },
        ],
    },
    {
        title: "General",
        items: [
            {
                title: "Notifications",
                href: "/dashboard/notifications",
                icon: BellIcon,
            },
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: SettingsIcon,
                items: settingsNav.map(({ title, href }) => ({ title, href })),
            },
            {
                title: "Help Center",
                href: "/dashboard/help",
                icon: LifeBuoyIcon,
            },
        ],
    },
];

export const workspaceModes = [
    {
        value: "student",
        label: "Student",
        icon: GraduationCapIcon,
        href: "/dashboard",
    },
    {
        value: "instructor",
        label: "Instructor",
        icon: PresentationIcon,
        href: "/dashboard/instructor",
    },
] as const;

export type WorkspaceMode = (typeof workspaceModes)[number]["value"];

export type CommandPaletteItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

export const commandPaletteGroups: {
    title: string;
    items: CommandPaletteItem[];
}[] = [
    {
        title: "Go To",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboardIcon,
            },
            {
                title: "Browse Courses",
                href: "/dashboard/courses",
                icon: CompassIcon,
            },
            {
                title: "My Learning",
                href: "/dashboard/learning",
                icon: GraduationCapIcon,
            },
            { title: "Wishlist", href: "/dashboard/wishlist", icon: HeartIcon },
            {
                title: "Certificates",
                href: "/dashboard/certificates",
                icon: AwardIcon,
            },
            {
                title: "Discussions",
                href: "/dashboard/discussions",
                icon: MessagesSquareIcon,
            },
            { title: "Messages", href: "/dashboard/messages", icon: MailIcon },
        ],
    },
    {
        title: "Settings",
        items: [
            {
                title: "Profile Settings",
                href: "/dashboard/settings/profile",
                icon: UserRoundIcon,
            },
            {
                title: "Account Settings",
                href: "/dashboard/settings/account",
                icon: ShieldCheckIcon,
            },
            {
                title: "Billing & Plan",
                href: "/dashboard/settings/billing",
                icon: CreditCardIcon,
            },
            {
                title: "Notification Preferences",
                href: "/dashboard/notifications",
                icon: BellIcon,
            },
        ],
    },
];

export const accountMenu: { title: string; href: string; icon: LucideIcon }[] =
    [
        {
            title: "Profile",
            href: "/dashboard/settings/profile",
            icon: UserRoundIcon,
        },
        {
            title: "Account",
            href: "/dashboard/settings/account",
            icon: ShieldCheckIcon,
        },
        {
            title: "Billing",
            href: "/dashboard/settings/billing",
            icon: CreditCardIcon,
        },
        {
            title: "Notifications",
            href: "/dashboard/notifications",
            icon: BellIcon,
        },
        { title: "Help Center", href: "/dashboard/help", icon: LifeBuoyIcon },
    ];
