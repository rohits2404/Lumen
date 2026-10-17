"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { QA_LAYOUT_PATH, QA_REPLY_MAX } from "@/lib/config/qa";

export type QaActionResult = {
    ok: boolean;
    message: string;
    voted?: boolean;
};

async function ownQuestion(userId: string, questionId: string) {
    const profile = await getInstructorProfile(userId);
    if (!profile) return null;

    return db.courseQuestion.findFirst({
        where: {
            id: questionId,
            deletedAt: null,
            course: { instructorId: profile.id },
        },
        select: { id: true, answeredByInstructor: true },
    });
}

export async function toggleQuestionVote(
    questionId: string,
): Promise<QaActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Vote." };

    const meId = session.user.id;
    const question = await ownQuestion(meId, questionId);
    if (!question)
        return { ok: false, message: "That Question Isn't Available." };

    const existing = await db.courseQuestionVote.findUnique({
        where: { questionId_userId: { questionId, userId: meId } },
        select: { id: true },
    });

    if (existing) {
        await db.$transaction([
            db.courseQuestionVote.delete({ where: { id: existing.id } }),
            db.courseQuestion.update({
                where: { id: questionId },
                data: { voteCount: { decrement: 1 } },
            }),
        ]);
        revalidatePath(QA_LAYOUT_PATH, "layout");
        return { ok: true, message: "Vote Removed.", voted: false };
    }

    await db.$transaction([
        db.courseQuestionVote.create({ data: { questionId, userId: meId } }),
        db.courseQuestion.update({
            where: { id: questionId },
            data: { voteCount: { increment: 1 } },
        }),
    ]);
    revalidatePath(QA_LAYOUT_PATH, "layout");
    return { ok: true, message: "Voted.", voted: true };
}

export async function createQuestionReply(
    questionId: string,
    body: string,
): Promise<QaActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Reply." };

    const text = body.trim();
    if (!text) return { ok: false, message: "Write a Reply First." };
    if (text.length > QA_REPLY_MAX) {
        return {
            ok: false,
            message: `Keep a Reply Under ${QA_REPLY_MAX} Characters.`,
        };
    }

    const meId = session.user.id;
    const question = await ownQuestion(meId, questionId);
    if (!question)
        return { ok: false, message: "That Question Isn't Available." };

    await db.$transaction([
        db.courseQuestionReply.create({
            data: { questionId, authorId: meId, body: text },
        }),
        db.courseQuestion.update({
            where: { id: questionId },
            data: {
                replyCount: { increment: 1 },
                answeredByInstructor: true,
            },
        }),
    ]);

    revalidatePath(QA_LAYOUT_PATH, "layout");
    return { ok: true, message: "Reply Posted." };
}
