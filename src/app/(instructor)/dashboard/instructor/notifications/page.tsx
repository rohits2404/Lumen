import { NotificationsFeed } from "@/components/dashboard/notifications/notifications-feed";
import { getNotificationFeed, parseFeedQuery } from "@/lib/notification-feed";
import { redirect } from "next/navigation";
import React from "react";

const InstructorNotificationsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const feed = await getNotificationFeed(
        "INSTRUCTOR",
        parseFeedQuery("INSTRUCTOR", params),
    );
    if (!feed) redirect("/login");

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <NotificationsFeed audience="INSTRUCTOR" feed={feed} />
        </main>
    );
};

export default InstructorNotificationsPage;
