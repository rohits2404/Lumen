export const adminNotifyAboutOptions = [
    { value: "ALL_ACTIVITY", label: "All Platform Activity" },
    { value: "NEEDS_ACTION", label: "Only Items That Need My Action" },
    { value: "NOTHING", label: "Nothing" },
] as const;

export type AdminNotifyAboutValue =
    (typeof adminNotifyAboutOptions)[number]["value"];

export const adminNotifyAboutValues = new Set<string>(
    adminNotifyAboutOptions.map((option) => option.value),
);

export const adminEmailNotifications = [
    {
        name: "adminApplicationEmails",
        title: "Instructor Applications",
        description: "A New Application Is Waiting For Your Review.",
    },
    {
        name: "adminCourseReviewEmails",
        title: "Course Submissions",
        description: "A Course Has Been Submitted And Is Awaiting Approval.",
    },
    {
        name: "adminReportEmails",
        title: "Reported Content",
        description: "A Learner Has Reported A Review Or A Discussion.",
    },
    {
        name: "adminPayoutEmails",
        title: "Payouts And Refunds",
        description: "Payout Runs, Failed Transfers, And Refund Activity.",
    },
    {
        name: "securityEmails",
        title: "Security Emails",
        description:
            "Sign-Ins From New Devices And Changes To Your Own Account.",
    },
] as const;

export type AdminEmailNotificationName =
    (typeof adminEmailNotifications)[number]["name"];

export const adminNotificationsHeadings = {
    notifyAbout: "Notify Me About…",
    emails: "Email Notifications",
} as const;

export const adminNotificationsCopy = {
    submit: "Update Notifications",
    saved: "Notification Preferences Updated.",
} as const;
