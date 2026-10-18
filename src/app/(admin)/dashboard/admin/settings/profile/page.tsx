import { AdminSettingsProfile } from "@/components/dashboard/admin/settings/admin-settings-profile";
import { getAdminProfile } from "@/lib/admin/settings";
import { redirect } from "next/navigation";
import React from "react";

const AdminSettingsProfilePage = async () => {
    const profile = await getAdminProfile();
    if (!profile) redirect("/login");

    return <AdminSettingsProfile profile={profile} />;
};

export default AdminSettingsProfilePage;
