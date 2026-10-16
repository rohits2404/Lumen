export const notifyAboutOptions = [
    { value: "ALL_ACTIVITY", label: "All New Activity" },
    { value: "DIRECT_MESSAGES", label: "Direct Messages And Mentions" },
    { value: "NOTHING", label: "Nothing" },
] as const;

export type NotifyAboutValue = (typeof notifyAboutOptions)[number]["value"];

export const notifyAboutValues = new Set<string>(
    notifyAboutOptions.map((option) => option.value),
);

export const emailNotifications = [
    {
        name: "courseEmails",
        title: "Course Emails",
        description:
            "New Lessons, Quizzes, And Deadlines In Your Enrolled Courses.",
    },
    {
        name: "marketingEmails",
        title: "Marketing Emails",
        description: "Receive Emails About New Courses, Features, And Offers.",
    },
    {
        name: "communityEmails",
        title: "Community Emails",
        description:
            "Replies To Your Posts, Mentions, And Discussion Activity.",
    },
    {
        name: "securityEmails",
        title: "Security Emails",
        description: "Receive Emails About Your Account Activity And Security.",
    },
] as const;

export type EmailNotificationName = (typeof emailNotifications)[number]["name"];

export const notificationsHeadings = {
    notifyAbout: "Notify Me About…",
    emails: "Email Notifications",
} as const;
