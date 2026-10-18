"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    adminEmailNotifications,
    adminNotificationsCopy,
    adminNotifyAboutValues,
    type AdminNotifyAboutValue,
} from "@/lib/config/admin-notifications";
import type { AdminNotificationSettings } from "@/lib/admin/notifications";

export type AdminNotificationsResult = { ok: boolean; message: string };

export async function updateAdminNotifications(
    input: AdminNotificationSettings,
): Promise<AdminNotificationsResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") {
        return {
            ok: false,
            message: "You Do Not Have Access To These Notification Settings.",
        };
    }

    const notifyAbout = String(input?.adminNotifyAbout ?? "");
    if (!adminNotifyAboutValues.has(notifyAbout)) {
        return {
            ok: false,
            message: "Pick What You'd Like To Be Notified About.",
        };
    }

    const toggles = Object.fromEntries(
        adminEmailNotifications.map((item) => [
            item.name,
            Boolean(input?.[item.name]),
        ]),
    ) as Record<(typeof adminEmailNotifications)[number]["name"], boolean>;

    await db.user.update({
        where: { id: session.user.id },
        data: {
            adminNotifyAbout: notifyAbout as AdminNotifyAboutValue,
            ...toggles,
        },
    });

    return { ok: true, message: adminNotificationsCopy.saved };
}
