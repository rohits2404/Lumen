import {
    CircleCheckIcon,
    FlameIcon,
    GraduationCapIcon,
    PresentationIcon,
    UsersRoundIcon,
    type LucideIcon,
} from "lucide-react";

import type {
    UserPlan,
    UsersQuery,
    UsersTab,
    UserStats,
} from "@/lib/admin/users";
import type { UserStatus } from "@/generated/prisma/client";

export const USERS_PAGE_SIZE = 8;

export function isUsersFiltered(query: UsersQuery): boolean {
    return (
        query.tab !== "all" ||
        query.query !== "" ||
        query.statuses.length > 0 ||
        query.plan !== null
    );
}

export const adminUsersCopy = {
    title: "Users",
    description:
        "Every Account On The Platform — Learners, Instructors, And Admins.",
    addLabel: "Add New User",
    searchPlaceholder: "Search Users...",
    filtersLabel: "Filters",
    columnsLabel: "Columns",
    filtersHeading: "Narrow The List",
    statusHeading: "Status",
    planHeading: "Plan",
    resetFilters: "Reset",
    columnsHeading: "Toggle Columns",
    emptyTitle: "No Matching Accounts",
    emptyDescription:
        "No Account Matches This Filter. Try A Different Tab, Status, Or Search.",
    clearFilters: "Clear Filters",
    bulkSuspend: "Suspend",
    bulkReactivate: "Reactivate",
    bulkClear: "Clear Selection",
    selectAllLabel: "Select Every Account On This Page",
    selectRowLabel: (name: string) => `Select ${name}`,
} as const;

export function showingLine(page: {
    page: number;
    total: number;
    rows: number;
    pageSize: number;
}): string {
    if (page.total === 0) return "No Users";
    const from = (page.page - 1) * page.pageSize + 1;
    const to = from + page.rows - 1;
    return `Showing ${from}–${to} Of ${page.total.toLocaleString("en-US")} ${
        page.total === 1 ? "User" : "Users"
    }`;
}

export const userStatCards: {
    key: keyof UserStats;
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "total", label: "Total Users", icon: UsersRoundIcon },
    { key: "activeThisWeek", label: "Active This Week", icon: FlameIcon },
    { key: "instructors", label: "Instructors", icon: PresentationIcon },
    { key: "newThisMonth", label: "New This Month", icon: CircleCheckIcon },
];

export const userTabs: { value: UsersTab; label: string }[] = [
    { value: "all", label: "All users" },
    { value: "students", label: "Students" },
    { value: "instructors", label: "Instructors" },
    { value: "admins", label: "Admins" },
    { value: "pending-instructors", label: "Pending instructors" },
];

export type ToggleableColumn = "role" | "plan" | "email" | "country";

export const toggleableColumns: { key: ToggleableColumn; label: string }[] = [
    { key: "role", label: "Role" },
    { key: "plan", label: "Plan" },
    { key: "email", label: "Email" },
    { key: "country", label: "Country" },
];

export const statusFilterOptions: { value: UserStatus; label: string }[] = [
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
];

export const planFilterOptions: { value: UserPlan | "any"; label: string }[] = [
    { value: "any", label: "Any plan" },
    { value: "free", label: "Free" },
    { value: "business", label: "Business" },
];

export type Badge = { label: string; className: string };

export function userRoleBadge(role: string | null | undefined): Badge {
    switch (role) {
        case "admin":
            return {
                label: "Admin",
                className: "bg-role-admin/10 text-role-admin",
            };
        case "instructor":
            return {
                label: "Instructor",
                className: "bg-role-instructor/10 text-role-instructor",
            };
        default:
            return {
                label: "Student",
                className: "bg-hover text-muted-foreground",
            };
    }
}

export function userStatusBadge(status: UserStatus): Badge {
    switch (status) {
        case "ACTIVE":
            return { label: "Active", className: "bg-success/10 text-success" };
        case "PENDING":
            return {
                label: "Pending",
                className: "bg-warning/10 text-warning",
            };
        case "INACTIVE":
            return {
                label: "Inactive",
                className: "bg-destructive/10 text-destructive",
            };
        case "SUSPENDED":
            return {
                label: "Suspended",
                className: "bg-destructive/10 text-destructive",
            };
    }
}

export const userPlanLabels: Record<UserPlan, string> = {
    free: "Free",
    business: "Business",
};

export const userRowMenu = {
    viewProfile: "View Profile",
    viewProfileUnavailable: "No Public Profile Yet",
    message: "Message",
    suspend: "Suspend",
    reactivate: "Reactivate",
} as const;

export const newUserCopy = {
    back: "Back To Users",
    title: "Add New User",
    description:
        "They Will Receive An Email Invitation To Set Their Own Password.",
    accountHeading: "Account Details",
    nameLabel: "Full Name",
    namePlaceholder: "Ada Lovelace",
    emailLabel: "Email",
    emailPlaceholder: "ada@example.com",
    countryLabel: "Country",
    planLabel: "Plan",
    roleHeading: "Role",
    roleDescription: "Determines What They Can See And Do Across The Platform.",
    inviteTitle: "Send Invitation Email",
    inviteDescription: "Turn Off To Create The Account Silently.",
    submit: "Create User",
    cancel: "Cancel",
} as const;

export const newUserRoles: {
    value: "user" | "instructor" | "admin";
    label: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        value: "user",
        label: "Student",
        description: "Can Enrol In And Complete Courses.",
        icon: GraduationCapIcon,
    },
    {
        value: "instructor",
        label: "Instructor",
        description: "Can Build, Publish, And Sell Courses.",
        icon: PresentationIcon,
    },
    {
        value: "admin",
        label: "Admin",
        description: "Full Access To The Admin Console.",
        icon: CircleCheckIcon,
    },
];

export const newUserPlans: { value: UserPlan; label: string }[] = [
    { value: "free", label: "Free" },
    { value: "business", label: "Business" },
];

export const INVITATION_TTL_DAYS = 14;
