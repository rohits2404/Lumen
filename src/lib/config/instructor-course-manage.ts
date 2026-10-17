import {
    BarChart3Icon,
    BookOpenTextIcon,
    FileQuestionIcon,
    MessageCircleQuestionMarkIcon,
    SettingsIcon,
    StarIcon,
    TicketPercentIcon,
    UsersRoundIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

import { editorQuizHref, editorStepHref } from "@/lib/config/course-editor";
import type { ManageFacts } from "@/lib/instructor-course-manage";

export const manageCourseCopy = {
    back: "Back To My Courses",
    lead: "Manage Everything About This Course From One Place.",
    preview: "Preview As Student",
    manageHeading: "Manage",
    healthHeading: "Course Health",
    activityHeading: "Recent Activity",
    activityEmpty: "Nothing Has Happened On This Course Yet.",
    noData: "No Data Yet",
} as const;

export const manageStatLabels = {
    students: "Students",
    rating: "Rating",
    revenue: "Revenue",
    lessons: "Lessons",
} as const;

export const publishToggleCopy = {
    unpublish: {
        action: "Unpublish",
        title: "Unpublish This Course?",
        description:
            "It Leaves The Catalog Immediately And No One New Can Buy It. Students Already Enrolled Keep Their Access, And You Can Republish At Any Time.",
        confirm: "Unpublish Course",
    },
    republish: {
        action: "Republish",
    },
} as const;

export type ManageRowKey =
    | "curriculum"
    | "quizzes"
    | "landing"
    | "students"
    | "qa"
    | "reviews"
    | "analytics"
    | "coupons";

export type ManageRow = {
    key: ManageRowKey;
    title: string;
    icon: LucideIcon;
    detail: (facts: ManageFacts) => string;
    badge?: (facts: ManageFacts) => string | null;
    navHref?: string;
};

export const manageGroups: {
    title: string;
    rows: ManageRow[];
}[] = [
    {
        title: "Content",
        rows: [
            {
                key: "curriculum",
                title: "Curriculum",
                icon: BookOpenTextIcon,
                detail: (facts) =>
                    `${plural(facts.sections, "Section")} · ${plural(facts.lessons, "Lesson")}`,
            },
            {
                key: "quizzes",
                title: "Quizzes",
                icon: FileQuestionIcon,
                detail: (facts) =>
                    facts.quizzes === 0
                        ? "No Quizzes In This Course Yet"
                        : `${plural(facts.quizzes, "Quiz", "Quizzes")} Across The Course`,
            },
            {
                key: "landing",
                title: "Landing Page & Pricing",
                icon: SettingsIcon,
                detail: () => "Title, Cover, Description, Price",
            },
        ],
    },
    {
        title: "Audience",
        rows: [
            {
                key: "students",
                title: "Students",
                icon: UsersRoundIcon,
                detail: () => "Progress And Messaging",
                badge: (facts) =>
                    facts.students === 0 ? null : formatCount(facts.students),
                navHref: "/dashboard/instructor/students",
            },
            {
                key: "qa",
                title: "Q&A",
                icon: MessageCircleQuestionMarkIcon,
                detail: () => "Questions From Learners",
                badge: (facts) =>
                    facts.unansweredQuestions === 0
                        ? null
                        : `${facts.unansweredQuestions} Unanswered`,
                navHref: "/dashboard/instructor/qa",
            },
            {
                key: "reviews",
                title: "Reviews",
                icon: StarIcon,
                detail: () => "Ratings And Your Replies",
                badge: (facts) =>
                    facts.unrepliedReviews === 0
                        ? null
                        : `${facts.unrepliedReviews} New`,
                navHref: "/dashboard/instructor/reviews",
            },
        ],
    },
    {
        title: "Growth",
        rows: [
            {
                key: "analytics",
                title: "Analytics",
                icon: BarChart3Icon,
                detail: () => "Enrolment, Revenue, Watch Time",
                navHref: "/dashboard/instructor/analytics",
            },
            {
                key: "coupons",
                title: "Coupons",
                icon: TicketPercentIcon,
                detail: () => "Run A Targeted Discount",
                badge: (facts) =>
                    facts.activeCoupons === 0
                        ? null
                        : `${facts.activeCoupons} Active`,
                navHref: "/dashboard/instructor/coupons",
            },
        ],
    },
];

export type ManageRowTarget = {
    id: string;
    slug: string;
    quizLessonIds: string[];
};

export const manageRowHref: Partial<
    Record<ManageRowKey, (course: ManageRowTarget) => string | undefined>
> = {
    curriculum: (course) => editorStepHref(course.slug, "curriculum"),
    quizzes: (course) => {
        const [only, ...rest] = course.quizLessonIds;
        if (only === undefined) return undefined;
        return rest.length === 0
            ? editorQuizHref(course.slug, only)
            : editorStepHref(course.slug, "curriculum");
    },
    landing: (course) => editorStepHref(course.slug, "landing-page"),
    students: (course) => `/dashboard/instructor/students?course=${course.id}`,
    qa: (course) => `/dashboard/instructor/qa?course=${course.id}`,
    reviews: (course) => `/dashboard/instructor/reviews?course=${course.id}`,
    analytics: () => "/dashboard/instructor/analytics",
    coupons: (course) => `/dashboard/instructor/coupons?course=${course.id}`,
};

export type HealthKey = "completion" | "watchTime" | "quizPass";

export const healthMetrics: {
    key: HealthKey;
    label: string;
    className: string;
}[] = [
    { key: "completion", label: "Completion Rate", className: "bg-success" },
    { key: "watchTime", label: "Avg. Watch Time", className: "bg-accent-2" },
    { key: "quizPass", label: "Quiz Pass Rate", className: "bg-accent-1" },
];

export type ActivityKind = "enrolment" | "review" | "question" | "earning";

export const activityTone: Record<ActivityKind, string> = {
    enrolment: "bg-accent-2/15 text-accent-2",
    review: "bg-star/15 text-star",
    question: "bg-accent-1/15 text-accent-1",
    earning: "bg-success/15 text-success",
};

export const activityIcon: Record<ActivityKind, LucideIcon> = {
    enrolment: UsersRoundIcon,
    review: StarIcon,
    question: MessageCircleQuestionMarkIcon,
    earning: WalletIcon,
};

function plural(count: number, one: string, many = `${one}s`): string {
    return `${count} ${count === 1 ? one : many}`;
}

function formatCount(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}
