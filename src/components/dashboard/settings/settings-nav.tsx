"use client";

import { SettingsNavCard } from "@/components/dashboard/settings/settings-nav-card";
import { settingsNav } from "@/lib/config/settings";

function SettingsNav() {
    return <SettingsNavCard items={settingsNav} />;
}

export { SettingsNav };
