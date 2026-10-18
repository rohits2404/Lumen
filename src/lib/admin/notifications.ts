import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { AdminNotifyAboutValue } from "@/lib/config/admin-notifications";

export type AdminNotificationSettings = {
    adminNotifyAbout: AdminNotifyAboutValue;
    adminApplicationEmails: boolean;
    adminCourseReviewEmails: boolean;
    adminReportEmails: boolean;
    adminPayoutEmails: boolean;
    securityEmails: boolean;
};

export async function getAdminNotificationSettings(): Promise<AdminNotificationSettings | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            adminNotifyAbout: true,
            adminApplicationEmails: true,
            adminCourseReviewEmails: true,
            adminReportEmails: true,
            adminPayoutEmails: true,
            securityEmails: true,
        },
    });
    if (!user) return null;

    return user;
}
