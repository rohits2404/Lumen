import { AdminSettingsNotifications } from "@/components/dashboard/admin/settings/admin-settings-notifications";
import { getAdminNotificationSettings } from "@/lib/admin/notifications";
import { redirect } from "next/navigation";
import React from "react";

const AdminSettingsPlatformPage = async () => {
    const settings = await getAdminNotificationSettings();
    if (!settings) redirect("/login");

    return <AdminSettingsNotifications settings={settings} />;
};

export default AdminSettingsPlatformPage;
