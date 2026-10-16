"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { feedCategories } from "@/lib/config/notification-feed";
import type { NotificationAudience } from "@/generated/prisma/client";

export type FeedActionResult = { ok: boolean; message: string };

function categoriesFor(audience: NotificationAudience) {
    return feedCategories[audience].map((entry) => entry.value);
}

function revalidateShells() {
    revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsRead(
    audience: NotificationAudience,
): Promise<FeedActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign in to continue." };

    const { count } = await db.notification.updateMany({
        where: {
            userId: session.user.id,
            audience,
            category: { in: categoriesFor(audience) },
            readAt: null,
        },
        data: { readAt: new Date() },
    });

    revalidateShells();
    return {
        ok: true,
        message:
            count === 0
                ? "Nothing left to mark."
                : `Marked ${count} notification${count === 1 ? "" : "s"} as read.`,
    };
}

export async function setNotificationRead(
    audience: NotificationAudience,
    notificationId: string,
    read: boolean,
): Promise<FeedActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign in to continue." };

    const { count } = await db.notification.updateMany({
        where: {
            id: notificationId,
            userId: session.user.id,
            audience,
            ...(read ? { readAt: null } : { NOT: { readAt: null } }),
        },
        data: { readAt: read ? new Date() : null },
    });

    if (count === 0) {
        return {
            ok: true,
            message: read ? "Already read." : "Already unread.",
        };
    }

    revalidateShells();
    return {
        ok: true,
        message: read ? "Marked as read." : "Marked as unread.",
    };
}

export async function resolveNotificationAction(
    audience: NotificationAudience,
    notificationId: string,
    accept: boolean,
): Promise<FeedActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign in to continue." };

    const notification = await db.notification.findFirst({
        where: { id: notificationId, userId: session.user.id, audience },
        select: { id: true, action: { select: { id: true, state: true } } },
    });
    if (!notification?.action) {
        return {
            ok: false,
            message: "That notification no longer exists — reload the page.",
        };
    }
    if (notification.action.state !== "PENDING") {
        return {
            ok: false,
            message:
                "That request has already been answered — reload the page.",
        };
    }

    const now = new Date();
    await db.$transaction([
        db.notificationAction.update({
            where: { id: notification.action.id },
            data: { state: accept ? "ACCEPTED" : "DECLINED", resolvedAt: now },
        }),
        db.notification.updateMany({
            where: { id: notification.id, readAt: null },
            data: { readAt: now },
        }),
    ]);

    revalidateShells();
    return { ok: true, message: accept ? "Accepted." : "Declined." };
}
