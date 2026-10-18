import { redirect } from "next/navigation";
import React from "react";

const AdminSettingsPage = () => {
    redirect("/dashboard/admin/settings/profile");
};

export default AdminSettingsPage;
