import { redirect } from "next/navigation";
import React from "react";

const InstructorSettingsPage = () => {
    redirect("/dashboard/instructor/settings/profile");
};

export default InstructorSettingsPage;
