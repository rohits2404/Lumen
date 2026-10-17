"use client";

import { SettingsNavCard } from "@/components/dashboard/settings/settings-nav-card";
import { instructorSettingsNav } from "@/lib/config/instructor-settings";

function InstructorSettingsNav() {
    return <SettingsNavCard items={instructorSettingsNav} />;
}

export { InstructorSettingsNav };
