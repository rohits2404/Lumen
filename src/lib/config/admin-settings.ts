import {
    BellIcon,
    SettingsIcon,
    ShieldCheckIcon,
    UserRoundIcon,
    type LucideIcon,
} from "lucide-react";

export type AdminSettingsNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    built: boolean;
};

export const adminSettingsNav: AdminSettingsNavItem[] = [
    {
        title: "Profile",
        href: "/dashboard/admin/settings/profile",
        icon: UserRoundIcon,
        built: true,
    },
    {
        title: "Account",
        href: "/dashboard/admin/settings/account",
        icon: ShieldCheckIcon,
        built: true,
    },
    {
        title: "Platform Controls",
        href: "/dashboard/admin/settings/platform",
        icon: SettingsIcon,
        built: true,
    },
    {
        title: "Notifications",
        href: "/dashboard/admin/settings/notifications",
        icon: BellIcon,
        built: true,
    },
];

export const adminSettingsHeading = {
    title: "Platform Settings",
    description:
        "Manage Your Admin Account And Control Platform-Wide Settings.",
} as const;

export const adminProfileCopy = {
    nameLabel: "Full Name",
    nameDescription:
        "Shown In The Admin Console And On Internal Notifications Only.",
    emailLabel: "Email",
    emailDescription:
        "Used To Sign In. Changing It Sends A Confirmation Link To Your Current Address — The New One Takes Effect Once You Follow It.",
    roleTitle: "Platform Admin",
    roleDescription: "Internal Role — Not Shown On A Public Profile.",
    submit: "Update Profile",
} as const;

export const platformControlsCopy = {
    title: "Platform Controls",
    description:
        "Levers That Affect Every User On Lumen. Change These With Care.",

    brandingHeading: "Branding",
    brandingDescription:
        "Logo, Favicon, Accent Colour, And How The Site Appears In Search Results.",
    uploadLogo: "Upload Logo",
    uploadFavicon: "Upload Favicon",
    accentLabel: "Accent Colour",

    searchHeading: "Search Appearance",
    searchDescription:
        "Used As The Page Title And Meta Description Across The Public Site.",
    websiteTitleLabel: "Website Title",
    metaDescriptionLabel: "Meta Description",
    searchPreviewLabel: "Search Preview",
    searchPreviewHost: "lumen.co",

    autosaveIdle: "Changes Save Automatically",
    autosaveSaving: "Saving…",
    autosaveSaved: "Changes Saved",
    autosaveError: "Couldn't Save — Try Again",

    accessHeading: "Access & Moderation",
    defaultsHeading: "Defaults",
    currencyLabel: "Platform Currency",
    revenueShareLabel: "Default Instructor Revenue Share",
    supportEmailLabel: "Support Email",

    dangerHeading: "Danger Zone",
} as const;

export const platformToggles = [
    {
        name: "instructorApplicationsOpen",
        title: "Instructor Applications",
        description: "Open — Anyone Can Apply To Teach On Lumen.",
    },
    {
        name: "newStudentSignupsOpen",
        title: "New Student Signups",
        description: "Open — New Learners Can Create Accounts.",
    },
    {
        name: "requireManualCourseReview",
        title: "Require Manual Course Review",
        description:
            "Every Submission Needs Admin Approval Before It Goes Live.",
    },
    {
        name: "autoEnrollNewCoursesInPromotions",
        title: "Auto-Enroll New Courses In Promotions",
        description:
            "Default Participation For Instructors Who Haven't Set A Preference. They Can Still Opt Out Per Course.",
    },
] as const;

export type PlatformToggleName = (typeof platformToggles)[number]["name"];

export const platformToggleNames = new Set<string>(
    platformToggles.map((toggle) => toggle.name),
);

export const maintenanceToggle = {
    name: "maintenanceMode",
    title: "Maintenance Mode",
    description:
        "Signs Everyone Out And Shows A Maintenance Page Except For Admins.",
    confirmTitle: "Turn On Maintenance Mode?",
    confirmDescription:
        "Every Signed-In Learner And Instructor Is Signed Out And Sees A Maintenance Page Until You Turn This Off. Admins Keep Their Access.",
    confirmAction: "Turn On Maintenance Mode",
} as const;

export const PLATFORM_ACCENTS = [
    "violet",
    "blue",
    "cyan",
    "green",
    "amber",
    "red",
] as const;

export const WEBSITE_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 160;
export const SUPPORT_EMAIL_MAX = 254;

export const platformCurrencies = [
    { value: "usd", label: "USD ($)" },
    { value: "eur", label: "EUR (€)" },
    { value: "gbp", label: "GBP (£)" },
    { value: "cad", label: "CAD ($)" },
    { value: "aud", label: "AUD ($)" },
] as const;

export const platformCurrencyValues = new Set<string>(
    platformCurrencies.map((currency) => currency.value),
);

export const revenueShareOptions = [
    { value: 5000, label: "50%" },
    { value: 6000, label: "60%" },
    { value: 7000, label: "70%" },
    { value: 8000, label: "80%" },
    { value: 9000, label: "90%" },
] as const;

export const revenueShareValues = new Set<number>(
    revenueShareOptions.map((option) => option.value),
);

export const BRANDING_MAX_BYTES = 2 * 1024 * 1024;

export const BRANDING_MIME_TYPES = [
    "image/png",
    "image/webp",
    "image/jpeg",
    "image/x-icon",
    "image/vnd.microsoft.icon",
] as const;

export type BrandingAssetKind = "logo" | "favicon";
