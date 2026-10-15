"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export type FollowActionResult = {
    ok: boolean;
    message: string;
    following: boolean;
    followerCount: number;
};

export async function setFollowingInstructor(
    instructorSlug: string,
    follow: boolean,
): Promise<FollowActionResult> {
    const session = await getSession();
    if (!session) {
        return {
            ok: false,
            message: "Sign In To Follow Instructors.",
            following: false,
            followerCount: 0,
        };
    }

    const instructor = await db.instructor.findUnique({
        where: { slug: instructorSlug },
        select: { id: true, name: true, userId: true },
    });
    if (!instructor) {
        return {
            ok: false,
            message: "This Instructor Can't Be Followed Yet.",
            following: false,
            followerCount: 0,
        };
    }
    if (instructor.userId === session.user.id) {
        return {
            ok: false,
            message: "You can't follow yourself.",
            following: false,
            followerCount: await db.instructorFollow.count({
                where: { instructorId: instructor.id },
            }),
        };
    }

    if (follow) {
        await db.instructorFollow.createMany({
            data: [{ userId: session.user.id, instructorId: instructor.id }],
            skipDuplicates: true,
        });
    } else {
        await db.instructorFollow.deleteMany({
            where: { userId: session.user.id, instructorId: instructor.id },
        });
    }

    const followerCount = await db.instructorFollow.count({
        where: { instructorId: instructor.id },
    });

    revalidatePath(`/dashboard/instructors/${instructorSlug}`);
    return {
        ok: true,
        message: follow
            ? `You're Following ${instructor.name}.`
            : `You Unfollowed ${instructor.name}.`,
        following: follow,
        followerCount,
    };
}
