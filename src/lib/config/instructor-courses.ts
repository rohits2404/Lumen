import type { CourseStatus } from "@/generated/prisma/client";
import type {
    InstructorCoursesQuery,
    MyCoursesTab,
} from "@/lib/instructor-courses";

export const COURSES_PAGE_SIZE = 5;

export const myCoursesCopy = {
    title: "My Courses",
    description:
        "Manage What You Teach — Edit Lessons, Track Enrolment, And Publish Updates.",
    createCourse: "Create Course",
    searchPlaceholder: "Search Your Courses...",
    manage: "Manage",
    continueEditing: "Continue Editing",
    authoringUnavailable:
        "The Course Editor Isn't Built Yet — This Lights Up With Create Course.",
    built: (percent: number) => `${percent}% Built`,
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${total === 1 ? "Course" : "Courses"}`,
    noMatches: "No Course Matches That Filter.",
    empty: {
        title: "No Courses Yet",
        description:
            "Everything You Teach Shows Up Here Once You Publish Your First Course.",
    },
} as const;

export const courseRowMenu = {
    label: "Actions For",
    viewSalePage: "View Sale Page",
    viewSalePageUnavailable:
        "A Course Only Has A Sale Page Once It Is Published.",
    questions: "Questions About This Course",
    coupons: "Coupons For This Course",
} as const;

export const myCoursesStats = {
    published: "Published",
    drafts: "Drafts",
    students: "Students",
    rating: "Avg. Rating",
} as const;

export const myCoursesTabs: { value: MyCoursesTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "drafts", label: "Drafts" },
    { value: "in-review", label: "In Review" },
];

export const myCoursesTabValues = new Set<string>(
    myCoursesTabs.map((tab) => tab.value),
);

export const tabStatuses: Record<MyCoursesTab, CourseStatus[] | null> = {
    all: null,
    published: ["PUBLISHED"],
    drafts: ["DRAFT", "NEEDS_CHANGES"],
    "in-review": ["IN_REVIEW"],
};

export function isMyCoursesFiltered(query: InstructorCoursesQuery): boolean {
    return query.tab !== "all" || query.query !== "";
}

export function hasBeenLive(status: CourseStatus): boolean {
    return status === "PUBLISHED" || status === "ARCHIVED";
}
