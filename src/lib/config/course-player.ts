import type { CourseLevel } from "@/lib/config/browse-courses";
import type { CourseReview, CourseSection } from "@/lib/config/course-details";

export type PlayerLessonState = "done" | "current" | "upcoming";

export type PlayerLesson = {
    title: string;
    meta: string;
    type: "video" | "article" | "quiz";
    state: PlayerLessonState;
    quizSlug?: string;
    id?: string;
    preview?: boolean;
    locked?: boolean;
};

export type QuizQuestion = {
    prompt: string;
    options: string[];
    answerIndex: number;
};

export type CourseQuiz = {
    slug: string;
    title: string;
    questions: QuizQuestion[];
};

export type PlayerSection = {
    title: string;
    lessons: PlayerLesson[];
};

export type QuestionReply = {
    name: string;
    role: "Instructor" | "Student";
    avatarUrl?: string;
    timeAgo: string;
    body: string;
};

export type CourseQuestion = {
    id: string;
    title: string;
    name: string;
    avatarUrl?: string;
    timeAgo: string;
    lessonTag: string;
    answered: boolean;
    replies: QuestionReply[];
};

export const QA_VISIBLE_REPLIES = 2;

export type CourseNote = {
    id: string;
    timestamp: string;
    body: string;
};

export type CoursePlayerCourse = {
    slug: string;
    access?: "full" | "preview";
    published?: boolean;
    title: string;
    art: string;
    instructor: {
        name: string;
        title: string;
        avatarUrl?: string;
        slug?: string;
    };
    progress: number;
    encouragement: string;
    sections: PlayerSection[];
    quizzes: CourseQuiz[];
    about: {
        description: string[];
        suitFor: string[];
    };
    questions: CourseQuestion[];
    rating: number;
    reviewsCount: number;
    reviews: CourseReview[];
    notes: CourseNote[];
};

export function buildEncouragement(title: string, progress: number) {
    if (progress >= 100) {
        return `Course Complete! 🎉 ${title} Is Done — Your Certificate Is Waiting In The Certificates Tab.`;
    }
    if (progress >= 60) {
        return `Almost There! 🎉 You've Covered Most Of ${title}. Keep The Streak Going — The Finish Line Is Close.`;
    }
    if (progress > 0) {
        return `Great Job! 🎉 You're On The Path To Mastering ${title.toLowerCase()}. Your Dedication To Learning Is Impressive — Finish Strong!`;
    }
    return `Welcome Aboard! 🎉 ${title} Starts With The First Lesson Below — Press Play Whenever You're Ready.`;
}

export function buildSuitFor({
    title,
    level,
    category,
}: {
    title: string;
    level: CourseLevel;
    category: string;
}) {
    const topic = title.toLowerCase();
    const audience =
        level === "Beginner" || level === "All Levels"
            ? "Beginners, Newbies & Amateurs"
            : `${level} Learners Ready To Go Deeper`;

    return [
        `Anyone Who Wants To Start Their Career & Get Paid For Their ${category.toLowerCase()} Skills.`,
        `${audience} In The Field Of ${topic}.`,
        `Anyone That Needs To Add "${title}" To Their Portfolio.`,
        `People Who Learn Best By Building Alongside The Lessons Rather Than Reading About Them.`,
    ];
}

export function buildSections(
    sections: CourseSection[],
    completedLessons: number,
): PlayerSection[] {
    let seen = 0;

    return sections.map((section) => ({
        title: section.title,
        lessons: section.lessons.map((lesson) => {
            const index = seen++;
            const state: PlayerLessonState =
                index < completedLessons
                    ? "done"
                    : index === completedLessons
                      ? "current"
                      : "upcoming";

            const isQuiz = lesson.type === "quiz";
            return {
                title: isQuiz ? `Quiz · ${lesson.title}` : lesson.title,
                meta: isQuiz
                    ? `${lesson.questions} Questions`
                    : `${lesson.minutes} Min`,
                type: isQuiz ? ("quiz" as const) : ("video" as const),
                state,
                ...(isQuiz ? { quizSlug: quizSlugOf(lesson.title) } : {}),
            };
        }),
    }));
}

function quizSlugOf(title: string) {
    return title
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function buildQuiz(sectionTitle: string, count: number): CourseQuiz {
    const templates: Array<[string, string[]]> = [
        [
            `What Is The Main Idea Behind "${sectionTitle}"?`,
            [
                "Building The Habit Before The Technique",
                "Memorising Every Shortcut First",
                "Skipping Straight To The Final Project",
                "Reading The Docs End To End",
            ],
        ],
        [
            "When Should You Move On To The Next Lesson?",
            [
                "Once You've Finished The Section's Exercise",
                "As Soon As The Video Ends",
                "After Watching It Twice",
                "Only After Finishing The Whole Course",
            ],
        ],
        [
            "Which Habit Does This Section Encourage Most?",
            [
                "Practising On Real Work As You Go",
                "Taking Notes Without Applying Them",
                "Comparing Yourself To Experts",
                "Waiting Until You Feel Ready",
            ],
        ],
        [
            "What Is The Most Common Mistake Covered Here?",
            [
                "Rushing The Setup And Paying For It Later",
                "Spending Too Long On The Exercise",
                "Asking Questions Too Early",
                "Re-Watching A Lesson",
            ],
        ],
        [
            "How Is This Section Structured?",
            [
                "Each Lesson Builds On The One Before It",
                "The Lessons Are Independent Of Each Other",
                "It's Reference Material, Not A Sequence",
                "It Only Makes Sense In Reverse",
            ],
        ],
        [
            "What Should You Have Finished Before The Next Section?",
            [
                "The Exercise This Section Closes On",
                "Every Optional Reading",
                "A Full Portfolio Piece",
                "Nothing In Particular",
            ],
        ],
    ];

    return {
        slug: quizSlugOf(sectionTitle),
        title: `Quiz · ${sectionTitle}`,
        questions: Array.from({ length: count }, (_, index) => {
            const [prompt, options] = templates[index % templates.length]!;
            return { prompt, options, answerIndex: 0 };
        }),
    };
}

export function buildQuizzes(sections: CourseSection[]): CourseQuiz[] {
    return sections.flatMap((section) =>
        section.lessons
            .filter((lesson) => lesson.type === "quiz")
            .map((lesson) => buildQuiz(lesson.title, lesson.questions ?? 5)),
    );
}

export function sectionProgress(section: PlayerSection) {
    const done = section.lessons.filter(
        (lesson) => lesson.state === "done",
    ).length;
    return { total: section.lessons.length, done };
}

export function courseTotals(sections: PlayerSection[]) {
    const lessons = sections.reduce(
        (sum, section) => sum + section.lessons.length,
        0,
    );
    return { sections: sections.length, lessons };
}
