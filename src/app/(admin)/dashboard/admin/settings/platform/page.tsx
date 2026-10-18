import { AdminSettingsPlatform } from "@/components/dashboard/admin/settings/admin-settings-platform";
import { getPlatformSettings } from "@/lib/admin/settings";
import React from "react";

const AdminSettingsPlatformPage = async () => {
    const settings = await getPlatformSettings();

    return <AdminSettingsPlatform settings={settings} />;
};

export default AdminSettingsPlatformPage;
