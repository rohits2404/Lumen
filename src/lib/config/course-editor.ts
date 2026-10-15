export type EditorStepKey =
    | "intended-learners"
    | "curriculum"
    | "landing-page"
    | "pricing"
    | "coupons"
    | "messages";

export type EditorStep = {
    key: EditorStepKey;
    title: string;
    built: boolean;
};

export const editorGroups: { title: string; steps: EditorStep[] }[] = [
    {
        title: "Plan Your Course",
        steps: [
            {
                key: "intended-learners",
                title: "Intended learners",
                built: true,
            },
        ],
    },
    {
        title: "Create Your Content",
        steps: [{ key: "curriculum", title: "Curriculum", built: true }],
    },
    {
        title: "Publish Your Course",
        steps: [
            { key: "landing-page", title: "Course Landing Page", built: true },
            { key: "pricing", title: "Pricing", built: true },
            { key: "coupons", title: "Coupons", built: true },
            { key: "messages", title: "Course Messages", built: true },
        ],
    },
];

export const editorSteps: EditorStep[] = editorGroups.flatMap(
    (group) => group.steps,
);

export const editorStepKeys = new Set<string>(
    editorSteps.filter((step) => step.built).map((step) => step.key),
);

export const FIRST_STEP: EditorStepKey = "intended-learners";

export function editorStepHref(courseSlug: string, step: EditorStepKey) {
    return `/dashboard/instructor/courses/${courseSlug}/edit/${step}`;
}

export function parseEditorStep(value: string | undefined): EditorStepKey {
    return value && editorStepKeys.has(value)
        ? (value as EditorStepKey)
        : FIRST_STEP;
}

export const courseEditorCopy = {
    title: "Create Course",
    saveDraft: "Save Draft",
    saveDraftUnavailable: {
        curriculum: "Curriculum Changes Save As You Make Them.",
        coupons: "Coupons Save When You Create Them.",
    } as Partial<Record<EditorStepKey, string>>,
    preview: "Preview As Student",
    publish: "Publish",
    stepUnavailable: "This Step Isn't Built Yet.",
    notFound: "That Step Doesn't Exist Yet.",
} as const;

export const publishCopy = {
    title: "Submit This Course For Review?",
    description:
        "Our Team Checks Every Course Before It Goes On Sale — Usually Within Two Business Days. You Can Keep Editing While It's In Review.",
    confirm: "Submit For Review",
    unavailable: {
        IN_REVIEW: "This Course Is Already With The Review Team.",
        PUBLISHED: "This Course Is Already Published.",
        ARCHIVED: "Republish This Course From Its Manage Page First.",
        REJECTED: "This Course Was Turned Down And Can't Be Resubmitted.",
    } as Record<string, string | undefined>,
} as const;

export const newCourseCopy = {
    title: "Create Course",
    lead: "Two Things To Start With. You Can Change Everything Else — The Price, The Description, The Cover — On The Steps That Follow.",
    name: {
        label: "What Is Your Course Called?",
        help: "You Can Rename It Later; The Web Address Stays As First Written.",
        placeholder: "E.g. Mastering Illustration",
    },
    category: {
        label: "Which Category Does It Belong In?",
        placeholder: "Choose A Category",
    },
    submit: "Create Course",
    back: "Back To My Courses",
} as const;

export const intendedLearnersCopy = {
    heading: "Intended Learners",
    lead: "The Descriptions You Write Here Appear On Your Course Landing Page And Help The Right Learners Find You.",
    outcomes: {
        label: "What Will Students Learn?",
        help: "List At Least Four Outcomes Learners Can Expect.",
        placeholder: "Add Another Outcome",
    },
    requirements: {
        label: "Requirements",
        placeholder: "Add A Requirement",
    },
    audience: {
        label: "Who Is This Course For?",
        placeholder:
            "Describe The Learner This Course Is Written For — Their Level, Their Goal, What They Already Know.",
    },
    save: "Save Changes",
    remove: "Remove",
} as const;

export const landingPageCopy = {
    heading: "Course Landing Page",
    lead: "This Is What Learners See Before They Enrol. A Sharp Title And Cover Image Do Most Of The Work.",
    title: {
        label: "Course Title",
        placeholder: "E.g. Mastering Illustration",
    },
    subtitle: {
        label: "Subtitle",
        placeholder: "One Line On What Learners Will Be Able To Do",
    },
    description: {
        label: "Description",
        placeholder:
            "What The Course Covers And Why It Matters. Leave A Blank Line Between Paragraphs.",
    },
    cover: {
        label: "Cover Image",
        upload: "Upload Image",
        replace: "Replace Image",
        uploading: "Uploading…",
        updated: "Cover Image Updated.",
        wrongType: "Use A JPEG, PNG Or WebP Image.",
        tooLarge: "Images Must Be Under 4 MB.",
        unconfigured:
            "Image Uploads Aren't Configured For This Environment Yet.",
    },
    save: "Save Landing Page",
    saved: "Landing Page Saved.",
    errors: {
        title: "Give Your Course A Title.",
    },
} as const;

export const LANDING_LIMITS = {
    title: 120,
    subtitle: 160,
    description: 5000,
} as const;

export const COVER_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;
export const COVER_MAX_BYTES = 4 * 1024 * 1024;

export const pricingCopy = {
    heading: "Pricing",
    lead: "Set Your List Price. Lumen Business Subscribers Can Always Access Your Course, And You Earn Per Minute Watched.",
    currency: { label: "Currency" },
    listPrice: { label: "List Price", placeholder: "Choose A Price" },
    business: {
        title: "Include In Lumen Business",
        description: "Reach Subscribers And Earn From Watch Time.",
    },
    promotion: {
        heading: "Current Promotion",
        none: "No Coupon Is Running On This Course Right Now.",
        manage: "Manage Coupons",
        discount: (percentOff: number) => `${percentOff}% Off`,
        redemptions: (count: number) =>
            `${new Intl.NumberFormat("en-US").format(count)} ${
                count === 1 ? "Redemption" : "Redemptions"
            }`,
    },
    save: "Save Pricing",
    saved: "Pricing Saved.",
    errors: {
        price: "Choose A List Price.",
        currency: "Choose A Currency.",
    },
} as const;

export const COURSE_CURRENCIES = [{ value: "usd", label: "USD ($)" }] as const;

export const PRICE_TIERS_CENTS = [
    1999, 2499, 2999, 3499, 3999, 4499, 4999, 5499, 5999, 6499, 6999, 7499,
    7999, 8499, 8999, 9499, 9999, 10999, 11999, 12999, 13999, 14999, 15999,
    17999, 19999,
] as const;

export function formatPrice(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export const courseCouponsCopy = {
    heading: "Coupons",
    lead: "Create Discount Codes For Launches, Partners, Or Your Mailing List. You Can Run Up To Three Active Coupons At A Time.",
    newCoupon: "New Coupon",
    stats: {
        active: "Active Coupons",
        redemptions: "Redemptions",
        revenue: "Revenue From Coupons",
    },
    columns: {
        code: "Code",
        discount: "Discount",
        price: "Price",
        usage: "Usage",
        status: "Status",
    },
    discount: (percentOff: number) => `${percentOff}% Off`,
    when: {
        active: (date: string | null) => date ?? "No End Date",
        scheduled: (date: string) => `Starts ${date}`,
        expired: (date: string) => `Ended ${date}`,
    },
    actions: {
        label: (code: string) => `Actions For ${code}`,
        edit: "Edit",
        copy: "Copy Code",
        copied: (code: string) => `${code} Copied.`,
        end: "End Coupon",
        endScheduled: "Cancel Coupon",
        ended: (code: string) => `${code} Ended.`,
        expired: "This Coupon Has Already Ended.",
    },
    empty: {
        title: "No Coupons Yet",
        description:
            "Create A Code Below And It Applies At Checkout For This Course.",
    },
    create: {
        heading: "Create A Coupon",
        code: "Code",
        codePlaceholder: "AUTUMN30",
        discount: "Discount",
        limit: "Redemption Limit",
        limitPlaceholder: "Unlimited",
        expires: "Expires",
        expiresPlaceholder: "Pick A Date",
        clearDate: "No End Date",
        submit: "Create Coupon",
    },
    needsPrice:
        "Set A List Price On The Pricing Step Before Creating A Coupon.",
} as const;

export const COUPON_PERCENT_OPTIONS = [
    5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
] as const;

export const courseMessagesCopy = {
    heading: "Course Messages",
    lead: "Automatic Messages Sent To Every Learner. Leave One Blank To Skip It.",
    welcome: {
        label: "Welcome Message",
        placeholder: "Sent When A Learner Enrols.",
    },
    congratulations: {
        label: "Congratulations Message",
        placeholder: "Sent When A Learner Finishes The Course.",
    },
    save: "Save Messages",
    saved: "Messages Saved.",
} as const;

export const COURSE_MESSAGE_MAX = 1000;

export const curriculumCopy = {
    heading: "Curriculum",
    summary: (lessons: number, sections: number) =>
        `${lessons} ${lessons === 1 ? "Lesson" : "Lessons"} Across ${sections} ${
            sections === 1 ? "Section" : "Sections"
        } · Drag A Row Or Use The Arrows To Reorder`,
    empty: {
        title: "No Sections Yet",
        description:
            "A Course Is Built From Sections, And Each Section Holds Its Lessons. Add The First One To Get Started.",
    },
    addSection: "Add Section",
    newSectionTitle: "Untitled Section",
    sectionLabel: (index: number) => `Section ${index + 1}`,
    lessonCount: (count: number) =>
        `${count} ${count === 1 ? "Lesson" : "Lessons"}`,
    sectionTitlePlaceholder: "Name This Section",
    lessonTitlePlaceholder: "Name This Lesson",
    saved: {
        section: "Section Renamed.",
        lesson: "Lesson Renamed.",
        duration: "Lesson Length Updated.",
        questions: "Question Count Updated.",
    },
    moveUp: "Move Up",
    moveDown: "Move Down",
    removeSection: "Delete Section",
    removeLesson: "Delete Lesson",
    preview: "Preview",
    editQuiz: "Edit Quiz",
    editArticle: "Edit Article",
    uploadVideo: "Upload Video",
    editVideo: "Edit Video",
    settling: "Saving This Lesson…",
    addLesson: { VIDEO: "Video", ARTICLE: "Article", QUIZ: "Quiz" },
    newLessonTitle: {
        VIDEO: "New Video Lesson",
        ARTICLE: "New Article",
        QUIZ: "New Quiz",
    },
    meta: {
        VIDEO: (minutes: number | null) =>
            minutes === null ? "Set Length" : `${minutes} Min`,
        ARTICLE: (minutes: number | null) =>
            minutes === null ? "Set Length" : `${minutes} Min Read`,
        QUIZ: (questions: number | null) =>
            questions === null
                ? "Set Questions"
                : `${questions} ${questions === 1 ? "Question" : "Questions"}`,
    },
} as const;

export function editorArticleHref(courseSlug: string, lessonId: string) {
    return `/dashboard/instructor/courses/${courseSlug}/edit/article/${lessonId}`;
}

export function editorQuizHref(courseSlug: string, lessonId: string) {
    return `/dashboard/instructor/courses/${courseSlug}/edit/quiz/${lessonId}`;
}

export const LESSON_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
] as const;
export const LESSON_VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const lessonVideoCopy = {
    title: "Lesson Video",
    lead: "This Is What Students Watch For This Lesson. The Lesson's Length Is Taken From The Video.",
    choose: "Choose A Video",
    dropHint: "MP4, WebM Or MOV, Up To 2 GB",
    drop: "Drop A Video Here, Or",
    uploading: (percent: number) => `Uploading… ${percent}%`,
    finishing: "Finishing Up…",
    replace: "Replace Video",
    remove: "Remove Video",
    cancel: "Cancel Upload",
    uploaded: "Video Uploaded.",
    removed: "Video Removed.",
    tooLarge: "That Video Is Larger Than 2 GB.",
    wrongType: "Upload An MP4, WebM Or MOV File.",
    failed: "The Upload Didn't Finish. Try Again.",
    unconfigured: "Video Uploads Aren't Configured On This Environment.",
} as const;

export const articleEditorCopy = {
    back: "Back To Curriculum",
    eyebrow: "Article",
    lead: "Students Read This As The Lesson. Its Reading Time Is Worked Out From The Length When You Save.",
    placeholder: "Start Writing Your Article…",
    save: "Save Article",
    saved: "Article Saved.",
    unsaved: "Unsaved Changes",
    allSaved: "All Changes Saved",
    toolbar: {
        paragraph: "Paragraph",
        heading2: "Heading",
        heading3: "Subheading",
        bulletList: "Bulleted List",
        orderedList: "Numbered List",
        bold: "Bold",
        italic: "Italic",
        undo: "Undo",
        redo: "Redo",
    },
} as const;

export const ARTICLE_MAX_CHARS = 200_000;

export const QUIZ_LIMITS = {
    questions: 50,
    minOptions: 2,
    maxOptions: 6,
    prompt: 500,
    option: 200,
} as const;

export const quizEditorCopy = {
    back: "Back To Curriculum",
    title: (lesson: string) => `Quiz · ${lesson}`,
    counter: (index: number, total: number) =>
        `Question ${index + 1} Of ${total}`,
    lead: "Write Each Question, Then Pick The Correct Answer By Clicking Its Letter. Students See These Exactly As Laid Out Here.",
    promptPlaceholder: "Write Your Question",
    optionPlaceholder: (letter: string) => `Answer ${letter}`,
    markCorrect: (letter: string) => `Mark ${letter} As The Correct Answer`,
    correct: "Correct Answer",
    addOption: "Add Answer",
    removeOption: "Remove Answer",
    addQuestion: "Add Question",
    deleteQuestion: "Delete Question",
    previous: "Previous",
    next: "Next",
    save: "Save Quiz",
    saved: "Quiz Saved.",
    unsaved: "Unsaved Changes",
    allSaved: "All Changes Saved",
    jumpTo: (index: number) => `Go To Question ${index + 1}`,
    errors: {
        noQuestions: "Add At Least One Question.",
        tooMany: `A Quiz Can Hold Up To ${QUIZ_LIMITS.questions} Questions.`,
        prompt: (n: number) => `Question ${n} Needs A Question.`,
        options: (n: number) =>
            `Question ${n} Needs At Least ${QUIZ_LIMITS.minOptions} Answers.`,
        blankOption: (n: number) => `Question ${n} Has An Empty Answer.`,
        duplicate: (n: number) => `Question ${n} Has The Same Answer Twice.`,
        correct: (n: number) => `Pick The Correct Answer For Question ${n}.`,
    },
} as const;

export const deleteCurriculumCopy = {
    lesson: {
        title: "Delete This Lesson?",
        description: (name: string) =>
            `“${name}” Will Be Removed From The Curriculum. This Can't Be Undone.`,
        submit: "Delete Lesson",
    },
    section: {
        title: "Delete This Section?",
        description: (name: string, lessons: number) =>
            lessons === 0
                ? `“${name}” Will Be Removed From The Curriculum. This Can't Be Undone.`
                : `“${name}” And The ${lessons === 1 ? "Lesson" : `${lessons} Lessons`} Inside It Will Be Removed. This Can't Be Undone.`,
        submit: "Delete Section",
    },
} as const;

export const LESSON_KINDS = ["VIDEO", "ARTICLE", "QUIZ"] as const;
export type LessonKind = (typeof LESSON_KINDS)[number];

export const lessonKindTone: Record<
    LessonKind,
    { pill: string; tile: string; label: string }
> = {
    VIDEO: {
        pill: "bg-accent-2/10 text-accent-2",
        tile: "bg-accent-2/10 text-accent-2",
        label: "Video",
    },
    ARTICLE: {
        pill: "bg-success/10 text-success",
        tile: "bg-success/10 text-success",
        label: "Article",
    },
    QUIZ: {
        pill: "bg-accent-1/10 text-accent-1",
        tile: "bg-accent-1/10 text-accent-1",
        label: "Quiz",
    },
};
