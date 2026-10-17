import { StudentsPage } from "@/components/dashboard/instructor/students";
import { getStudentsPage, parseStudentsQuery } from "@/lib/instructor-students";
import { notFound } from "next/navigation";
import React from "react";

const InstructorStudentsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const page = await getStudentsPage(parseStudentsQuery(params));
    if (!page) notFound();

    return <StudentsPage page={page} />;
};

export default InstructorStudentsPage;
