import { CoursesPage } from "@/components/dashboard/admin/courses";
import { parseCoursesQuery } from "@/lib/admin/courses";
import React from "react";

const AdminCoursesPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    return <CoursesPage query={parseCoursesQuery(params)} />;
};

export default AdminCoursesPage;
