import { SettingsNotifications } from "@/components/dashboard/settings/settings-notifications";
import { getNotificationSettings } from "@/lib/notifications";
import { redirect } from "next/navigation";
import React from "react";

const SettingsNotificationsPage = async () => {
    const settings = await getNotificationSettings();
    if (!settings) redirect("/login");

    return <SettingsNotifications settings={settings} />;
};

export default SettingsNotificationsPage;
