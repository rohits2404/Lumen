export type ProductionCourse = {
    slug: string;
    title: string;
    published: number;
    total: number;
};

export type SpendSlice = {
    label: string;
    value: number;
    color: "var(--chart-1)" | "var(--chart-2)" | "var(--chart-3)";
};

export type TopCourse = {
    slug: string;
    title: string;
    categoryName: string;
    categorySlug: string;
    art: string;
    thumbnailUrl: string | null;
    rating: number;
    students: number;
};

export type InstructorOverview = {
    firstName: string;
    learnersThisMonth: number;
    production: ProductionCourse[];
    completion: {
        percent: number;
        deltaPercent: number;
        previousPercent: number;
        enrolled: number;
        completed: number;
    };
    output: {
        watchPercent: number;
        publishedLessonPercent: number;
        completionPercent: number;
        drafts: number;
        published: number;
    };
    spend: SpendSlice[];
    revenue: { month: string; cents: number }[];
    revenueDeltaPercent: number;
    topCourses: TopCourse[];
};

export const TOP_COURSES_PER_PAGE = 6;

export const instructorOverviewCards = {
    welcome: {
        greeting: (firstName: string) => `Hi, ${firstName}`,
        headline: (learners: number) =>
            learners === 1
                ? "Your Courses Taught 1 Learner This Month."
                : `Your Courses Taught ${learners.toLocaleString("en-US")} Learners This Month.`,
        headlineEmpty: "Your First Course Is Waiting To Be Written.",
        lead: "Review Student Progress, Answer Open Questions, And Publish Your Next Lesson.",
        cta: "Create A Course",
    },
    production: {
        title: "Courses In Production",
        lessons: (published: number, total: number) =>
            `${published} Of ${total} Lessons Published`,
        emptyTitle: "Nothing In Production",
        emptyBody:
            "Courses You Are Still Writing Show Up Here With Their Publishing Progress.",
    },
    completion: {
        title: "Student Completion Rate",
        previous: (percent: number) => `Previous: ${percent}%`,
        target: "Target: 100%",
        enrolled: "Enrolled Students",
        completed: "Completed A Course",
        share: (percent: number) => `${percent}% Of Enrolled Students`,
        cta: "View Student Report",
    },
    output: {
        title: "Course Output",
        watchLabel: "Avg. Watch Completion",
        barsCaption: "Lessons Published · Students Finished",
        drafts: "Drafts",
        published: "Published",
    },
    spend: {
        title: "Where Students Spend Time",
        emptyBody:
            "Once Students Start Completing Lessons, This Splits Their Time By Lesson Type.",
    },
    revenue: {
        title: "Revenue By Month",
        compared: (delta: number) =>
            `Compared To Previous Month ${delta >= 0 ? "+" : ""}${delta}%`,
        emptyBody: "Your Share Of Each Sale Appears Here Once A Course Sells.",
    },
    top: {
        title: "Your Top Courses",
        search: "Search Courses",
        columns: {
            name: "Course Name",
            category: "Category",
            score: "Score",
            students: "Students",
        },
        count: (n: number) => `${n} Course(s)`,
        emptyTitle: "No Published Courses Yet",
        emptyBody: "Approved Courses Are Listed Here, Ranked By Enrolments.",
    },
} as const;
