import { NewCourseForm } from "@/components/dashboard/instructor/courses/edit/new-course-form";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { notFound } from "next/navigation";
import React from "react";

const NewInstructorCourseForm = async () => {
    const session = await getSession();
    if (!session) notFound();

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) notFound();

    const categories = await db.category.findMany({
        where: { parentId: null },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
    });

    return <NewCourseForm categories={categories} />;
};

export default NewInstructorCourseForm;
