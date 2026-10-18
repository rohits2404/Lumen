import { NotificationsFeed } from "@/components/dashboard/notifications/notifications-feed";
import { getNotificationFeed, parseFeedQuery } from "@/lib/notification-feed";
import { redirect } from "next/navigation";
import React from "react";

const AdminNotificationsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const feed = await getNotificationFeed(
        "ADMIN",
        parseFeedQuery("ADMIN", params),
    );
    if (!feed) redirect("/login");

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <NotificationsFeed audience="ADMIN" feed={feed} />
        </main>
    );
};

export default AdminNotificationsPage;
