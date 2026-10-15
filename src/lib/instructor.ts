import { cache } from "react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const canBecomeInstructor = cache(
    async function canBecomeInstructor(user: {
        id: string;
        role?: string | null;
    }) {
        if (user.role === "admin" || user.role === "instructor") return false;

        const profile = await db.instructor.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        return profile === null;
    },
);

export const getInstructorProfile = cache(async function getInstructorProfile(
    userId: string,
) {
    return db.instructor.findUnique({
        where: { userId },
        select: { id: true, slug: true, name: true },
    });
});

export const canTeach = cache(async function canTeach(user: {
    id: string;
    role?: string | null;
}) {
    if (user.role === "instructor") return true;
    return (await getInstructorProfile(user.id)) !== null;
});

export const canManageCourse = cache(async function canManageCourse(
    courseSlug: string,
) {
    const session = await getSession();
    if (!session) return false;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return false;

    const course = await db.course.findFirst({
        where: { slug: courseSlug, instructorId: profile.id },
        select: { id: true },
    });
    return course !== null;
});
