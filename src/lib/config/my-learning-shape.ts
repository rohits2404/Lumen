export type EnrolledCourse = {
    id: string;
    slug: string;
    title: string;
    instructor: string;
    categoryName: string;
    categorySlug: string;
    art: string;
    thumbnailUrl: string | null;
    level: string;
    durationHours: number;
    rating: number;
    reviews: number;
    price: number;
    listPrice: number;
    completedLessons: number;
    totalLessons: number;
    progress: number;
    nextLesson: string;
    completed: boolean;
};

export type LearningStat = {
    label: string;
    value: string;
    icon: string;
};

export const LEARNING_PER_PAGE = 4;

export const learningTabs = [
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
] as const;

export type LearningTabValue = (typeof learningTabs)[number]["value"];
