"use client";

import { SettingsNavCard } from "@/components/dashboard/settings/settings-nav-card";
import { adminSettingsNav } from "@/lib/config/admin-settings";

function AdminSettingsNav() {
    return <SettingsNavCard items={adminSettingsNav} />;
}

export { AdminSettingsNav };
