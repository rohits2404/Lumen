import { SettingsNotifications } from "@/components/dashboard/instructor/settings/settings-notifications";
import { getInstructorNotificationSettings } from "@/lib/instructor-notifications";
import { redirect } from "next/navigation";
import React from "react";

const InstructorNotificationSettingsPage = async () => {
    const settings = await getInstructorNotificationSettings();
    if (!settings) redirect("/login");

    return <SettingsNotifications settings={settings} />;
};

export default InstructorNotificationSettingsPage;
