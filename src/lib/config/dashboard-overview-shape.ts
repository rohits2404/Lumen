export type LearningPath = {
    title: string;
    completed: number;
    total: number;
    tone: "success" | "warning";
};

export type ActivitySlice = {
    label: string;
    value: number;
    color: "var(--chart-1)" | "var(--chart-2)" | "var(--chart-3)";
};

export type ContinueLearningCourse = {
    slug: string;
    title: string;
    category: string;
    categorySlug: string;
    score: number;
    progress: number;
    art: string;
};

export const CONTINUE_THRESHOLD = 15;

export type OverviewData = {
    learningPaths: LearningPath[];
    overall: {
        percent: number;
        deltaPercent: number;
        coursesEnrolled: number;
        coursesCompleted: number;
    };
    activity: ActivitySlice[];
    weekly: { week: string; value: number }[];
    continueLearning: ContinueLearningCourse[];
};
