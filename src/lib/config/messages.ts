export type MessageAudience = "LEARNER" | "INSTRUCTOR";

export const CONVERSATION_LIMIT = 50;

export const THREAD_MESSAGE_LIMIT = 100;

export const MESSAGE_MAX = 4000;

export const MESSAGE_SEARCH_MAX = 100;

export const PRESENCE_WINDOW_HOURS = 24;

export const messagesCopy = {
    title: "Messages",
    searchPlaceholder: "Search Conversations",
    composerPlaceholder: "Type a Message...",
    send: "Send Message",
    attach: "Attachments Aren't Available Yet",
    newMessage: "New Message",
    presence: "Active Today",
    noMatches: "No Conversations Match That Search.",
} as const;

export const messagesLead: Record<MessageAudience, string> = {
    LEARNER: "Ask Your Instructors About The Courses You're Enrolled In.",
    INSTRUCTOR: "Answer The Students Enrolled In The Courses You Teach.",
};

export const counterpartRole: Record<MessageAudience, string> = {
    LEARNER: "Instructor",
    INSTRUCTOR: "Student",
};

export const messagesEmpty: Record<
    MessageAudience,
    { title: string; description: string }
> = {
    LEARNER: {
        title: "No Conversations Yet",
        description:
            "Start One With The Instructor Of Any Course You're Enrolled In.",
    },
    INSTRUCTOR: {
        title: "No Conversations Yet",
        description:
            "Start One With Any Student Enrolled In A Course You Teach.",
    },
};

export const newMessageCopy: Record<
    MessageAudience,
    { title: string; description: string; search: string; empty: string }
> = {
    LEARNER: {
        title: "Message An Instructor",
        description:
            "You Can Write To The Instructor Of Any Course You're Enrolled In.",
        search: "Search Instructors And Courses",
        empty: "Enrol In A Course And Its Instructor Will Appear Here.",
    },
    INSTRUCTOR: {
        title: "Message A Student",
        description:
            "You Can Write To Any Student Enrolled In A Course You Teach.",
        search: "Search Students And Courses",
        empty: "Students Appear Here Once They Enrol In One Of Your Courses.",
    },
};

export const messagesHref: Record<MessageAudience, string> = {
    LEARNER: "/dashboard/messages",
    INSTRUCTOR: "/dashboard/instructor/messages",
};

export const messagesLayoutPath: Record<MessageAudience, string> = {
    LEARNER: "/dashboard",
    INSTRUCTOR: "/dashboard/instructor",
};

export const closedThreadReason: Record<MessageAudience, string> = {
    LEARNER:
        "You're No Longer Enrolled In This Course, So This Conversation Is Read-Only.",
    INSTRUCTOR:
        "This Student Is No Longer Enrolled In The Course, So This Conversation Is Read-Only.",
};
