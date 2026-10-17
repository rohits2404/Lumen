import type { StudentsQuery } from "@/lib/instructor-students";

export const STUDENTS_PAGE_SIZE = 6;

export const MESSAGE_ALL_LIMIT = 200;

export const STUDENTS_EXPORT_LIMIT = 5000;

export const studentsCopy = {
    title: "Students",
    description:
        "Everyone Enrolled In Your Courses — Track Progress And Reach Out When Someone Stalls.",
    exportCsv: "Export CSV",
    messageAll: "Message All",
    allCourses: "All Courses",
    searchPlaceholder: "Search Students...",
    message: (name: string) => `Message ${name}`,
    neverActive: "Not Started",
    lessons: (done: number, total: number) => `${done} / ${total} Lessons`,
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${total === 1 ? "Student" : "Students"}`,
    noMatches: "No Student Matches That Filter.",
    empty: {
        title: "No Students Yet",
        description:
            "Everyone Who Enrols In One Of Your Courses Appears Here, With How Far They Have Got.",
    },
    exported: (rows: number) =>
        `Exported ${rows} ${rows === 1 ? "Row" : "Rows"}.`,
    exportTruncated: (rows: number) =>
        `Exported The First ${rows} Rows — Narrow The Filter To Export The Rest.`,
} as const;

export const studentStats = {
    total: "Total Students",
    activeThisWeek: "Active This Week",
    completion: "Completion Rate",
    rating: "Avg. Rating",
} as const;

export type StudentTab = "all" | "active" | "completed";

export const studentTabs: { value: StudentTab; label: string }[] = [
    { value: "all", label: "All Students" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
];

export const studentTabValues = new Set<string>(
    studentTabs.map((tab) => tab.value),
);

export function isStudentsFiltered(query: StudentsQuery): boolean {
    return query.tab !== "all" || query.courseId !== null || query.query !== "";
}

export type StudentStatus = "active" | "completed";

export const studentStatusLabel: Record<StudentStatus, string> = {
    active: "Active",
    completed: "Completed",
};

export const studentStatusBadge: Record<StudentStatus, string> = {
    active: "bg-success/10 text-success",
    completed: "bg-accent-2/10 text-accent-2",
};
