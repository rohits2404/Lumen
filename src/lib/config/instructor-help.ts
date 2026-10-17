import {
    BadgeCheckIcon,
    BookOpenIcon,
    RocketIcon,
    TicketPercentIcon,
    UsersRoundIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

export type HelpTopic = {
    slug: string;
    title: string;
    description: string;
    icon: LucideIcon;
};

export const helpTopics: HelpTopic[] = [
    {
        slug: "becoming-an-instructor",
        title: "Becoming An Instructor",
        description:
            "Course Requirements, The Review Process, And Publishing Your First Course.",
        icon: RocketIcon,
    },
    {
        slug: "course-creation",
        title: "Course Creation",
        description:
            "Building A Curriculum, Lesson Types, Quizzes, And Reordering Content.",
        icon: BookOpenIcon,
    },
    {
        slug: "teaching-and-students",
        title: "Teaching & Students",
        description:
            "Answering Q&A, Running Discussions, And Keeping Cohorts Engaged.",
        icon: UsersRoundIcon,
    },
    {
        slug: "earnings-and-payouts",
        title: "Earnings & Payouts",
        description:
            "Revenue Share, Payout Schedule, And Fixing A Failed Payout.",
        icon: WalletIcon,
    },
    {
        slug: "pricing-and-coupons",
        title: "Pricing & Coupons",
        description:
            "Setting A List Price And Running Promotions That Convert.",
        icon: TicketPercentIcon,
    },
    {
        slug: "policies-and-standards",
        title: "Policies & Standards",
        description:
            "Content Rights, Accuracy Rules, And How Review Disputes Work.",
        icon: BadgeCheckIcon,
    },
];

export type HelpFacts = {
    revenueSharePercent: number;
    payoutDayOfMonth: number;
    minimumPayout: string;
    supportEmail: string;
};

export type HelpFaq = { question: string; answer: string };

function ordinal(day: number): string {
    const suffix =
        day % 100 >= 11 && day % 100 <= 13
            ? "th"
            : (["th", "st", "nd", "rd"][day % 10] ?? "th");
    return `${day}${suffix}`;
}

export function instructorFaqs(facts: HelpFacts): HelpFaq[] {
    return [
        {
            question: "How Long Does Course Review Take?",
            answer: "Up To Two Business Days. You Can Keep Editing While A Course Is In Review — Your Changes Are Picked Up When It Is Approved.",
        },
        {
            question: "What Revenue Share Do I Earn?",
            answer: `You Keep ${facts.revenueSharePercent}% Of Each Sale. The Rate Is Recorded On The Order At The Moment Of Purchase, So A Later Change To The Platform Default Never Re-Prices Something You Have Already Earned On.`,
        },
        {
            question: "When Are Payouts Sent?",
            answer: `Earnings Clear About 30 Days After The Sale, Then Join Your Next Run — The ${ordinal(facts.payoutDayOfMonth)} Of Each Month, Provided Your Available Balance Has Reached ${facts.minimumPayout}. A Balance Below That Rolls Over Rather Than Being Lost, And A Failed Transfer Is Retried On The Following Run.`,
        },
        {
            question: "Can I Remove A Negative Review?",
            answer: "No. Reviews Are Never Removed For Being Critical — Only For Breaking The Guidelines. If One Does Break Them, Report It And A Moderator Will Decide; Otherwise The Better Answer Is To Reply To It, Which Every Reader Of The Review Will See.",
        },
        {
            question: "Can I Change My Course Price After Launch?",
            answer: "Yes, And A New List Price Applies To Future Orders Only — Nobody Is Charged Again And Nobody Is Refunded The Difference. Promotions Work Alongside It: A Platform-Wide Sale Discounts Your Current List Price For As Long As It Runs, And You Can Opt A Course Out Of Those In Its Pricing Settings.",
        },
    ];
}

export const instructorHelpCopy = {
    title: "How Can We Help?",
    lead: "Guides For Building, Publishing, And Growing Your Courses On Lumen.",
    searchPlaceholder: "Search Help Articles...",
    topicsHeading: "Browse By Topic",
    faqHeading: "Frequently Asked",
    articles: (count: number) => `${count} Article${count === 1 ? "" : "s"}`,
    noResults: "No Help Articles Matched That Search.",
    noResultsHint: "Try A Shorter Phrase, Or Ask Support Below.",
    support: {
        title: "Still Stuck?",
        description: "Our Support Team Replies Within One Business Day.",
        action: "Contact Support",
        subject: "Instructor Support Request",
    },
    community: {
        title: "Ask The Community",
        description:
            "Instructors And Learners Answer Questions In Discussions Every Day.",
        action: "Open Discussions",
        unavailable: "Discussions Is Coming Soon",
    },
} as const;
