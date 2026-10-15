import { InstructorProfilePage } from "@/components/dashboard/instructors";
import { courseReturnLink } from "@/lib/course-return";
import { db } from "@/lib/db";
import { getProfileRelationship } from "@/lib/instructor-relationship";
import { getPublicInstructor } from "@/lib/public-instructor";
import { notFound } from "next/navigation";
import React from "react";

async function courseExists(slug: string) {
    const row = await db.course.findUnique({
        where: { slug },
        select: { id: true },
    });
    return row !== null;
}

const InstructorPage = async ({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ from?: string; via?: string; preview?: string }>;
}) => {
    const { slug } = await params;
    const { from, via, preview } = await searchParams;
    const instructor = await getPublicInstructor(slug);
    if (!instructor) notFound();

    const databaseCourse =
        typeof from === "string" && from !== "" && !(await courseExists(from))
            ? await db.course
                  .findUnique({ where: { slug: from }, select: { id: true } })
                  .then((row) => row !== null)
                  .catch(() => false)
            : false;

    const { href: backHref, label: backLabel } = courseReturnLink({
        from,
        via,
        preview,
        databaseCourse,
    });

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <InstructorProfilePage
                instructor={instructor}
                backHref={backHref}
                backLabel={backLabel}
                relationship={await getProfileRelationship(instructor.slug)}
            />
        </main>
    );
};

export default InstructorPage;
