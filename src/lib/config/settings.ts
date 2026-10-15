import {
    BellIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    UserRoundIcon,
    type LucideIcon,
} from "lucide-react";

export type SettingsNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    built: boolean;
};

export const settingsNav: SettingsNavItem[] = [
    {
        title: "Profile",
        href: "/dashboard/settings/profile",
        icon: UserRoundIcon,
        built: true,
    },
    {
        title: "Account",
        href: "/dashboard/settings/account",
        icon: ShieldCheckIcon,
        built: true,
    },
    {
        title: "Billing",
        href: "/dashboard/settings/billing",
        icon: CreditCardIcon,
        built: true,
    },
    {
        title: "Notifications",
        href: "/dashboard/settings/notifications",
        icon: BellIcon,
        built: true,
    },
];

export const settingsHeading = {
    title: "Settings",
    description: "Manage Your Account Settings And Set E-Mail Preferences.",
} as const;

export const MAX_NAME_LENGTH = 100;

export const MAX_EMAIL_LENGTH = 254;

export const MIN_AGE_YEARS = 13;

export const MAX_PROFILE_URLS = 5;

export const MAX_BIO_LENGTH = 400;

export const USERNAME_CHANGE_DAYS = 30;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const AVATAR_MAX_BYTES = 4 * 1024 * 1024;

export const AVATAR_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
] as const;
