"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { setLessonComplete } from "@/lib/completion";
import { db } from "@/lib/db";

export type LearningActionResult = { ok: boolean; message?: string };

export async function markLessonComplete(
    lessonId: string,
    complete = true,
): Promise<LearningActionResult> {
    const session = await getSession();
    if (!session)
        return { ok: false, message: "Sign in to track your progress." };

    const lesson = await db.courseLesson.findUnique({
        where: { id: lessonId },
        select: {
            id: true,
            section: {
                select: {
                    course: {
                        select: {
                            id: true,
                            slug: true,
                            enrollments: {
                                where: { userId: session.user.id },
                                select: { id: true },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    });

    const course = lesson?.section.course;
    const enrollmentId = course?.enrollments[0]?.id;
    if (!course || !enrollmentId) {
        return {
            ok: false,
            message: "That lesson isn't part of a course you're taking.",
        };
    }

    await setLessonComplete({ enrollmentId, lessonId, complete });

    revalidatePath("/dashboard", "layout");

    return { ok: true };
}
