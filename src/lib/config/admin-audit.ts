import type { AuditCategory, AuditTab } from "@/lib/admin/audit-log";
import { userRoleBadge } from "@/lib/config/admin-users";

export const adminAuditCopy = {
    title: "Audit Log",
    description:
        "Every Privileged Action Taken By A Member, With Who Did It And When.",
    exportLabel: "Export Log",
    searchPlaceholder: "Search Actions Or Members...",
    retentionNote:
        "Entries Are Retained For 24 Months And Cannot Be Edited Or Deleted.",
    emptyTitle: "No Matching Activity",
    emptyDescription:
        "No Entries Match This Filter. Try A Different Category Or Search.",
    clearFilters: "Clear Filters",
} as const;

export const auditTabs: { value: AuditTab; label: string }[] = [
    { value: "all", label: "All Activity" },
    { value: "members", label: "Members" },
    { value: "courses", label: "Courses" },
    { value: "billing", label: "Billing" },
    { value: "security", label: "Security" },
];

export const auditCategoryStyles: Record<AuditCategory, string> = {
    MEMBERS: "bg-accent-1/10 text-accent-1",
    COURSES: "bg-accent-2/10 text-accent-2",
    BILLING: "bg-success/10 text-success",
    SECURITY: "bg-destructive/10 text-destructive",
};

export const auditCategoryLabels: Record<AuditCategory, string> = {
    MEMBERS: "Members",
    COURSES: "Courses",
    BILLING: "Billing",
    SECURITY: "Security",
};

export function auditRoleBadge(actorRole: string | null): {
    label: string;
    className: string;
} {
    if (actorRole === null) {
        return { label: "System", className: "bg-hover text-muted-foreground" };
    }
    return userRoleBadge(actorRole);
}

export const auditTargetTypeLabels: Record<string, string> = {
    course: "Course",
    user: "Member",
    instructor: "Instructor",
    payout: "Payout",
    promotion: "Promotion",
};
