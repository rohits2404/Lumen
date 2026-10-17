import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { InstructorNotifyAboutValue } from "@/lib/config/instructor-notifications";

export type InstructorNotificationSettings = {
    instructorNotifyAbout: InstructorNotifyAboutValue;
    instructorCourseEmails: boolean;
    instructorStudentEmails: boolean;
    instructorCommunityEmails: boolean;
    instructorEarningEmails: boolean;
    securityEmails: boolean;
};

export async function getInstructorNotificationSettings(): Promise<InstructorNotificationSettings | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            instructorNotifyAbout: true,
            instructorCourseEmails: true,
            instructorStudentEmails: true,
            instructorCommunityEmails: true,
            instructorEarningEmails: true,
            securityEmails: true,
        },
    });
    if (!user) return null;

    return user;
}
