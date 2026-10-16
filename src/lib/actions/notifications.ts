"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    emailNotifications,
    notifyAboutValues,
    type NotifyAboutValue,
} from "@/lib/config/notifications";
import type { NotificationSettings } from "@/lib/notifications";

export type NotificationsActionResult = {
    ok: boolean;
    message: string;
};

export async function updateNotifications(
    input: NotificationSettings,
): Promise<NotificationsActionResult> {
    const session = await getSession();
    if (!session) {
        return { ok: false, message: "Sign In To Update Your Notifications." };
    }

    const notifyAbout = String(input?.notifyAbout ?? "");
    if (!notifyAboutValues.has(notifyAbout)) {
        return {
            ok: false,
            message: "Pick What You'd Like To Be Notified About.",
        };
    }

    const toggles = Object.fromEntries(
        emailNotifications.map((item) => [
            item.name,
            Boolean(input?.[item.name]),
        ]),
    ) as Record<(typeof emailNotifications)[number]["name"], boolean>;

    await db.user.update({
        where: { id: session.user.id },
        data: {
            notifyAbout: notifyAbout as NotifyAboutValue,
            ...toggles,
        },
    });

    return { ok: true, message: "Notification Preferences Updated." };
}
