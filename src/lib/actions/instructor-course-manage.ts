"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canTeach, getInstructorProfile } from "@/lib/instructor";

export type PublishActionResult = { ok: boolean; message: string };

export async function setCoursePublished(
    courseId: string,
    published: boolean,
): Promise<PublishActionResult> {
    const session = await getSession();
    if (!session)
        return { ok: false, message: "Please Sign In And Try Again." };
    if (!(await canTeach(session.user))) {
        return { ok: false, message: "Only Instructors Can Manage a Course." };
    }

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) {
        return { ok: false, message: "Only Instructors Can Manage a Course." };
    }

    const course = await db.course.findFirst({
        where: { id: courseId, instructorId: profile.id },
        select: { id: true, title: true, status: true },
    });
    if (!course)
        return { ok: false, message: "That Course Could Not Be Found." };

    const from = published ? "ARCHIVED" : "PUBLISHED";
    if (course.status !== from) {
        return {
            ok: false,
            message: published
                ? "That Course Is Not Currently Unpublished."
                : "That Course Is Not Currently Published.",
        };
    }

    await db.$transaction([
        db.course.update({
            where: { id: course.id },
            data: { status: published ? "PUBLISHED" : "ARCHIVED" },
        }),
        db.auditLog.create({
            data: {
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role ?? null,
                action: published ? "course.republished" : "course.unpublished",
                targetType: "course",
                targetId: course.id,
                targetLabel: course.title,
                category: "COURSES",
            },
        }),
    ]);
    revalidatePath("/dashboard", "layout");

    return {
        ok: true,
        message: published
            ? `${course.title} Is Back In The Catalog.`
            : `${course.title} Is No Longer On Sale.`,
    };
}
