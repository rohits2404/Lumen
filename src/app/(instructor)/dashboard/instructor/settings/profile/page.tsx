import { SettingsProfile } from "@/components/dashboard/settings/settings-profile";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import React from "react";

const InstructorSettingsProfilePage = async () => {
    const profile = await getProfile();
    if (!profile) redirect("/login");

    return <SettingsProfile profile={profile} />;
};

export default InstructorSettingsProfilePage;
