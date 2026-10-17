import type { CourseStatus } from "@/generated/prisma/client";

export type Badge = { label: string; className: string };

export function courseStatusBadge(status: CourseStatus): Badge {
    switch (status) {
        case "IN_REVIEW":
            return {
                label: "In review",
                className: "bg-accent-2/10 text-accent-2",
            };
        case "NEEDS_CHANGES":
            return {
                label: "Needs changes",
                className: "bg-warning/10 text-warning",
            };
        case "PUBLISHED":
            return {
                label: "Published",
                className: "bg-success/10 text-success",
            };
        case "REJECTED":
            return {
                label: "Rejected",
                className: "bg-destructive/10 text-destructive",
            };
        case "ARCHIVED":
            return {
                label: "Archived",
                className: "bg-hover text-muted-foreground",
            };
        default:
            return { label: "Draft", className: "bg-warning/10 text-warning" };
    }
}
