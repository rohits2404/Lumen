export const instructorNotifyAboutOptions = [
    { value: "ALL_ACTIVITY", label: "All New Activity" },
    { value: "DIRECT_MESSAGES", label: "Direct Messages And Mentions" },
    { value: "NOTHING", label: "Nothing" },
] as const;

export type InstructorNotifyAboutValue =
    (typeof instructorNotifyAboutOptions)[number]["value"];

export const instructorNotifyAboutValues = new Set<string>(
    instructorNotifyAboutOptions.map((option) => option.value),
);

export const instructorEmailNotifications = [
    {
        name: "instructorCourseEmails",
        title: "Course Emails",
        description:
            "Review Decisions, Approvals, And Status Changes On The Courses You Teach.",
    },
    {
        name: "instructorStudentEmails",
        title: "Student Emails",
        description:
            "New Enrolments, Questions, And Reviews From Your Students.",
    },
    {
        name: "instructorCommunityEmails",
        title: "Community Emails",
        description: "Replies And Mentions In Discussions On Your Courses.",
    },
    {
        name: "instructorEarningEmails",
        title: "Earnings Emails",
        description: "Sales, Payouts, And Failed Transfers.",
    },
    {
        name: "securityEmails",
        title: "Security Emails",
        description:
            "Sign-Ins From New Devices And Changes To Your Own Account.",
    },
] as const;

export type InstructorEmailNotificationName =
    (typeof instructorEmailNotifications)[number]["name"];

export const instructorNotificationsHeadings = {
    notifyAbout: "Notify Me About…",
    emails: "Email Notifications",
} as const;

export const instructorNotificationsCopy = {
    submit: "Update Notifications",
    saved: "Notification Preferences Updated.",
} as const;
