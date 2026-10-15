"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import {
    DISCUSSION_BODY_MAX,
    DISCUSSION_TITLE_MAX,
    discussionsLayoutPath,
    type DiscussionAudience,
} from "@/lib/config/discussions";

export type DiscussionActionResult = {
    ok: boolean;
    message: string;
    liked?: boolean;
    discussionId?: string;
};

async function isStaff(userId: string) {
    return (await getInstructorProfile(userId)) !== null;
}

export async function toggleDiscussionLike(
    audience: DiscussionAudience,
    discussionId: string,
): Promise<DiscussionActionResult> {
    const session = await getSession();
    if (!session)
        return { ok: false, message: "Sign In To Like a Discussion." };

    const meId = session.user.id;
    const staff = await isStaff(meId);
    const discussion = await db.discussion.findFirst({
        where: {
            id: discussionId,
            status: "PUBLISHED",
            deletedAt: null,
            ...(staff ? {} : { topic: { visibility: { not: "STAFF_ONLY" } } }),
        },
        select: { id: true },
    });
    if (!discussion) {
        return { ok: false, message: "That Discussion Isn't Available." };
    }

    const existing = await db.discussionLike.findUnique({
        where: {
            userId_targetType_targetId: {
                userId: meId,
                targetType: "DISCUSSION",
                targetId: discussionId,
            },
        },
        select: { id: true },
    });

    if (existing) {
        await db.$transaction([
            db.discussionLike.delete({ where: { id: existing.id } }),
            db.discussion.update({
                where: { id: discussionId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);
        return { ok: true, message: "Like Removed.", liked: false };
    }

    await db.$transaction([
        db.discussionLike.create({
            data: {
                userId: meId,
                targetType: "DISCUSSION",
                targetId: discussionId,
            },
        }),
        db.discussion.update({
            where: { id: discussionId },
            data: { likeCount: { increment: 1 } },
        }),
    ]);
    return { ok: true, message: "Liked.", liked: true };
}

export async function setDiscussionPinned(
    audience: DiscussionAudience,
    discussionId: string,
    pinned: boolean,
): Promise<DiscussionActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Moderate." };

    const meId = session.user.id;
    const discussion = await db.discussion.findFirst({
        where: { id: discussionId, deletedAt: null },
        select: { id: true, topicId: true, isPinned: true },
    });
    if (!discussion) {
        return { ok: false, message: "That Discussion Isn't Available." };
    }

    const seat = await db.topicModerator.findUnique({
        where: {
            topicId_userId: { topicId: discussion.topicId, userId: meId },
        },
        select: { canPin: true },
    });
    const admin = session.user.role === "admin";
    if (!admin && !seat?.canPin) {
        return {
            ok: false,
            message: "You Can Only Pin Threads In A Topic You Moderate.",
        };
    }

    await db.discussion.update({
        where: { id: discussionId },
        data: { isPinned: pinned },
    });

    revalidatePath(discussionsLayoutPath[audience], "layout");
    return {
        ok: true,
        message: pinned ? "Pinned To The Top." : "Unpinned.",
        discussionId,
    };
}

export type NewDiscussionInput = {
    topicId: string;
    title: string;
    body: string;
    tags: string;
};

export async function createDiscussion(
    audience: DiscussionAudience,
    input: NewDiscussionInput,
): Promise<DiscussionActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Post." };

    const meId = session.user.id;
    const staff = (await isStaff(meId)) || session.user.role === "admin";

    const title = input.title.trim();
    const body = input.body.trim();
    if (title.length < 3 || title.length > DISCUSSION_TITLE_MAX) {
        return {
            ok: false,
            message: `Give It a Title Between 3 And ${DISCUSSION_TITLE_MAX} Characters.`,
        };
    }
    if (body.length < 1 || body.length > DISCUSSION_BODY_MAX) {
        return {
            ok: false,
            message: `Write a Message Under ${DISCUSSION_BODY_MAX} Characters.`,
        };
    }

    const topic = await db.communityTopic.findFirst({
        where: {
            id: input.topicId,
            ...(staff ? {} : { visibility: { not: "STAFF_ONLY" } }),
        },
        select: {
            id: true,
            learnersCanStartThreads: true,
            requiresModeratorApproval: true,
        },
    });
    if (!topic)
        return { ok: false, message: "Choose A Topic You Can Post In." };
    if (!staff && !topic.learnersCanStartThreads) {
        return {
            ok: false,
            message: "Only Staff Can Start Threads In This Topic.",
        };
    }

    const tags = [
        ...new Set(
            input.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 4),
        ),
    ];

    const discussion = await db.discussion.create({
        data: {
            topicId: topic.id,
            authorId: meId,
            title,
            body,
            tags,
            status: topic.requiresModeratorApproval
                ? "PENDING_APPROVAL"
                : "PUBLISHED",
        },
        select: { id: true, status: true },
    });

    revalidatePath(discussionsLayoutPath[audience], "layout");
    return {
        ok: true,
        message:
            discussion.status === "PENDING_APPROVAL"
                ? "Posted — A Moderator Will Approve It Before It Appears."
                : "Discussion Posted.",
        discussionId: discussion.id,
    };
}

export async function toggleReplyLike(
    audience: DiscussionAudience,
    replyId: string,
): Promise<DiscussionActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Like a Reply." };

    const meId = session.user.id;
    const staff = await isStaff(meId);
    const reply = await db.discussionReply.findFirst({
        where: {
            id: replyId,
            deletedAt: null,
            discussion: {
                status: "PUBLISHED",
                deletedAt: null,
                ...(staff
                    ? {}
                    : { topic: { visibility: { not: "STAFF_ONLY" } } }),
            },
        },
        select: { id: true },
    });
    if (!reply) return { ok: false, message: "That Reply Isn't Available." };

    const existing = await db.discussionLike.findUnique({
        where: {
            userId_targetType_targetId: {
                userId: meId,
                targetType: "DISCUSSION_REPLY",
                targetId: replyId,
            },
        },
        select: { id: true },
    });

    if (existing) {
        await db.$transaction([
            db.discussionLike.delete({ where: { id: existing.id } }),
            db.discussionReply.update({
                where: { id: replyId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);
        return { ok: true, message: "Like Removed.", liked: false };
    }

    await db.$transaction([
        db.discussionLike.create({
            data: {
                userId: meId,
                targetType: "DISCUSSION_REPLY",
                targetId: replyId,
            },
        }),
        db.discussionReply.update({
            where: { id: replyId },
            data: { likeCount: { increment: 1 } },
        }),
    ]);
    return { ok: true, message: "Liked.", liked: true };
}

export async function createDiscussionReply(
    audience: DiscussionAudience,
    discussionId: string,
    body: string,
): Promise<DiscussionActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Reply." };

    const text = body.trim();
    if (!text) return { ok: false, message: "Write a Reply First." };
    if (text.length > DISCUSSION_BODY_MAX) {
        return {
            ok: false,
            message: `Keep A Reply Under ${DISCUSSION_BODY_MAX} Characters.`,
        };
    }

    const meId = session.user.id;
    const staff = await isStaff(meId);
    const discussion = await db.discussion.findFirst({
        where: {
            id: discussionId,
            status: "PUBLISHED",
            deletedAt: null,
            ...(staff ? {} : { topic: { visibility: { not: "STAFF_ONLY" } } }),
        },
        select: { id: true, isLocked: true },
    });
    if (!discussion) {
        return { ok: false, message: "That Discussion Isn't Available." };
    }
    if (discussion.isLocked) {
        return { ok: false, message: "This Thread Is Locked." };
    }

    await db.$transaction([
        db.discussionReply.create({
            data: { discussionId, authorId: meId, body: text },
        }),
        db.discussion.update({
            where: { id: discussionId },
            data: { replyCount: { increment: 1 } },
        }),
    ]);

    revalidatePath(discussionsLayoutPath[audience], "layout");
    return { ok: true, message: "Reply Posted.", discussionId };
}
