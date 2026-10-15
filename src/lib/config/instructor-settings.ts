import {
    BellIcon,
    ShieldCheckIcon,
    UserRoundIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

export type InstructorSettingsNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    built: boolean;
};

export const instructorSettingsNav: InstructorSettingsNavItem[] = [
    {
        title: "Profile",
        href: "/dashboard/instructor/settings/profile",
        icon: UserRoundIcon,
        built: true,
    },
    {
        title: "Account",
        href: "/dashboard/instructor/settings/account",
        icon: ShieldCheckIcon,
        built: true,
    },
    {
        title: "Payout Settings",
        href: "/dashboard/instructor/settings/payouts",
        icon: WalletIcon,
        built: true,
    },
    {
        title: "Notifications",
        href: "/dashboard/instructor/settings/notifications",
        icon: BellIcon,
        built: true,
    },
];

export const instructorSettingsHeading = {
    title: "Settings",
    description:
        "Manage Your Teaching Account, Payouts, And Notification Preferences.",
} as const;
