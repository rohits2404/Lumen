import { cache } from "react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { userHasBusinessPlan } from "@/lib/subscription";

export const canAccessCourseContent = cache(
    async function canAccessCourseContent(courseId: string): Promise<boolean> {
        const session = await getSession();
        if (!session) return false;
        if (session.user.role === "admin") return true;

        const [enrollment, owned] = await Promise.all([
            db.enrollment.findUnique({
                where: {
                    userId_courseId: { userId: session.user.id, courseId },
                },
                select: { id: true },
            }),
            db.course.findFirst({
                where: {
                    id: courseId,
                    instructor: { userId: session.user.id },
                },
                select: { id: true },
            }),
        ]);
        if (enrollment !== null || owned !== null) return true;

        if (!(await userHasBusinessPlan(session.user.id))) return false;

        const included = await db.course.findFirst({
            where: {
                id: courseId,
                status: "PUBLISHED",
                includedInBusiness: true,
            },
            select: { id: true },
        });
        return included !== null;
    },
);
