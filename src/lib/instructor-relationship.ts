import { cache } from "react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export type ProfileRelationship = {
    isSelf: boolean;
    followable: boolean;
    following: boolean;
    followerCount: number;
    messageCourses: { id: string; title: string }[];
};

export const getProfileRelationship = cache(
    async function getProfileRelationship(
        instructorSlug: string,
    ): Promise<ProfileRelationship> {
        const none: ProfileRelationship = {
            isSelf: false,
            followable: false,
            following: false,
            followerCount: 0,
            messageCourses: [],
        };

        try {
            return await read(instructorSlug, none);
        } catch (error) {
            console.error(
                `[Instructor-Relationship] Falling Back For "${instructorSlug}" — ` +
                    `Follow And Message Are Hidden. Is The Instructor_Follow Migration ` +
                    `Deployed? Run: Npm Run Db:Deploy`,
                error,
            );
            return none;
        }
    },
);

async function read(
    instructorSlug: string,
    none: ProfileRelationship,
): Promise<ProfileRelationship> {
    const session = await getSession();
    if (!session) return none;

    const instructor = await db.instructor.findUnique({
        where: { slug: instructorSlug },
        select: { id: true, userId: true },
    });
    if (!instructor) return none;

    if (instructor.userId === session.user.id) {
        return { ...none, isSelf: true };
    }

    const [following, followerCount, enrollments] = await Promise.all([
        db.instructorFollow.findUnique({
            where: {
                userId_instructorId: {
                    userId: session.user.id,
                    instructorId: instructor.id,
                },
            },
            select: { id: true },
        }),
        db.instructorFollow.count({ where: { instructorId: instructor.id } }),
        instructor.userId
            ? db.enrollment.findMany({
                  where: {
                      userId: session.user.id,
                      course: { instructorId: instructor.id },
                  },
                  orderBy: { createdAt: "desc" },
                  select: { course: { select: { id: true, title: true } } },
              })
            : Promise.resolve([]),
    ]);

    return {
        isSelf: false,
        followable: true,
        following: following !== null,
        followerCount,
        messageCourses: enrollments.map((row) => row.course),
    };
}
