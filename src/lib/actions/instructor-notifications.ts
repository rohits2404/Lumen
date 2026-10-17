"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canTeach } from "@/lib/instructor";
import {
    instructorEmailNotifications,
    instructorNotificationsCopy,
    instructorNotifyAboutValues,
    type InstructorNotifyAboutValue,
} from "@/lib/config/instructor-notifications";
import type { InstructorNotificationSettings } from "@/lib/instructor-notifications";

export type InstructorNotificationsResult = { ok: boolean; message: string };

export async function updateInstructorNotifications(
    input: InstructorNotificationSettings,
): Promise<InstructorNotificationsResult> {
    const session = await getSession();
    if (!session || !(await canTeach(session.user))) {
        return {
            ok: false,
            message: "You do not have access to these notification settings.",
        };
    }

    const notifyAbout = String(input?.instructorNotifyAbout ?? "");
    if (!instructorNotifyAboutValues.has(notifyAbout)) {
        return {
            ok: false,
            message: "Pick what you'd like to be notified about.",
        };
    }

    const toggles = Object.fromEntries(
        instructorEmailNotifications.map((item) => [
            item.name,
            Boolean(input?.[item.name]),
        ]),
    ) as Record<(typeof instructorEmailNotifications)[number]["name"], boolean>;

    await db.user.update({
        where: { id: session.user.id },
        data: {
            instructorNotifyAbout: notifyAbout as InstructorNotifyAboutValue,
            ...toggles,
        },
    });

    return { ok: true, message: instructorNotificationsCopy.saved };
}
