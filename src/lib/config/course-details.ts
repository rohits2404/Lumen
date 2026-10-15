import type { BrowseCourse } from "@/lib/config/browse-courses";

export type LessonType = "video" | "article" | "quiz" | "practice";

export type CourseLesson = {
    id?: string;
    title: string;
    type: LessonType;
    minutes?: number;
    questions?: number;
    preview?: boolean;
    previewSeconds?: number;
};

export type CourseSection = {
    title: string;
    lessonsLabel: string;
    durationLabel: string;
    lessons: CourseLesson[];
};

export type CourseInstructorProfile = {
    slug?: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl?: string;
    teachingSince: number;
    rating: number;
    reviewsCount: number;
    studentsCount: number;
    coursesCount: number;
};

export type CourseReview = {
    name: string;
    avatarUrl?: string;
    rating: number;
    timeAgo: string;
    body: string;
};

export type RatingBreakdownRow = { stars: 5 | 4 | 3 | 2 | 1; percent: number };

export type CourseDetail = BrowseCourse & {
    thumbnailUrl?: string | null;
    subtitle: string;
    description: string[];
    learningOutcomes: string[];
    requirements: string[];
    reviewsCount: number;
    saleEndsInDays: number;
    discountPercent: number;
    includes: {
        videoHours: number;
        articlesCount: number;
        quizzesCount: number;
        downloadableResources: boolean;
        certificate: boolean;
        lifetimeAccess: boolean;
    };
    contentSummary: string;
    sections: CourseSection[];
    instructorProfile: CourseInstructorProfile;
    studentReviews: CourseReview[];
    ratingBreakdown: RatingBreakdownRow[];
};
