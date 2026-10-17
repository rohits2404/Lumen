import { MyCourses } from "@/components/dashboard/instructor/courses";
import { instructorNav } from "@/lib/config/instructor-nav";
import {
    getInstructorCoursesPage,
    parseInstructorCoursesQuery,
} from "@/lib/instructor-courses";
import { notFound } from "next/navigation";
import React from "react";

const AUTHORING_HREF = "/dashboard/instructor/courses/new";

function authoringBuilt(): boolean {
    const row = instructorNav
        .flatMap((group) => group.items)
        .find((item) => item.href === AUTHORING_HREF);
    return row?.built ?? false;
}

const InstructorCoursesPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const page = await getInstructorCoursesPage(
        parseInstructorCoursesQuery(params),
    );
    if (!page) notFound();

    return <MyCourses page={page} authoringBuilt={authoringBuilt()} />;
};

export default InstructorCoursesPage;
