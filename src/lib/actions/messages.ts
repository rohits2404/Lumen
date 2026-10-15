"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    getMessageCandidates,
    resolvePairing,
    type MessageCandidate,
} from "@/lib/messages";
import {
    MESSAGE_MAX,
    messagesLayoutPath,
    type MessageAudience,
} from "@/lib/config/messages";

export type MessageActionResult = {
    ok: boolean;
    message: string;
    conversationId?: string;
};

async function openThread(meId: string, conversationId: string) {
    const conversation = await db.conversation.findFirst({
        where: {
            id: conversationId,
            participants: { some: { userId: meId } },
        },
        select: {
            id: true,
            courseId: true,
            participants: { select: { userId: true } },
        },
    });
    if (!conversation) return null;

    const counterpartId = conversation.participants.find(
        (participant) => participant.userId !== meId,
    )?.userId;
    if (!counterpartId || !conversation.courseId) return null;

    return { conversation, counterpartId, courseId: conversation.courseId };
}

export async function sendMessage(
    audience: MessageAudience,
    conversationId: string,
    body: string,
): Promise<MessageActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Send a Message." };

    const text = body.trim();
    if (!text) return { ok: false, message: "Write a Message First." };
    if (text.length > MESSAGE_MAX) {
        return {
            ok: false,
            message: `Messages Are Limited To ${MESSAGE_MAX} Characters.`,
        };
    }

    const meId = session.user.id;
    const open = await openThread(meId, conversationId);
    if (!open)
        return { ok: false, message: "That Conversation Isn't Available." };

    const pairing = await resolvePairing(
        meId,
        open.counterpartId,
        open.courseId,
    );
    if (!pairing) {
        return {
            ok: false,
            message:
                "This Conversation Is Read-Only: The Enrolment Behind It Has Ended.",
        };
    }

    await db.$transaction([
        db.message.create({
            data: { conversationId, senderId: meId, body: text },
        }),
        db.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        }),
        db.conversationParticipant.updateMany({
            where: { conversationId, userId: meId },
            data: { lastReadAt: new Date() },
        }),
    ]);

    revalidatePath(messagesLayoutPath[audience], "layout");
    return { ok: true, message: "Message Sent.", conversationId };
}

export async function startConversation(
    audience: MessageAudience,
    counterpartId: string,
    courseId: string,
): Promise<MessageActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Send a Message." };

    const meId = session.user.id;
    const pairing = await resolvePairing(meId, counterpartId, courseId);
    if (!pairing) {
        return {
            ok: false,
            message:
                audience === "INSTRUCTOR"
                    ? "You Can Only Message Students Enrolled In A Course You Teach."
                    : "You Can Only Message The Instructor Of A Course You're Enrolled In.",
        };
    }

    const existing = await db.conversation.findFirst({
        where: {
            courseId,
            AND: [
                { participants: { some: { userId: meId } } },
                { participants: { some: { userId: counterpartId } } },
            ],
        },
        select: { id: true },
    });
    if (existing) {
        revalidatePath(messagesLayoutPath[audience], "layout");
        return {
            ok: true,
            message: "Opened Your Existing Conversation.",
            conversationId: existing.id,
        };
    }

    const conversation = await db.conversation.create({
        data: {
            courseId,
            participants: {
                create: [
                    { userId: meId, lastReadAt: new Date() },
                    { userId: counterpartId },
                ],
            },
        },
        select: { id: true },
    });

    revalidatePath(messagesLayoutPath[audience], "layout");
    return {
        ok: true,
        message: "Conversation Started.",
        conversationId: conversation.id,
    };
}

export async function markConversationRead(
    audience: MessageAudience,
    conversationId: string,
): Promise<MessageActionResult> {
    const session = await getSession();
    if (!session)
        return { ok: false, message: "Sign In To Read Your Messages." };

    const updated = await db.conversationParticipant.updateMany({
        where: { conversationId, userId: session.user.id },
        data: { lastReadAt: new Date() },
    });
    if (updated.count === 0) {
        return { ok: false, message: "That Conversation Isn't Available." };
    }

    revalidatePath(messagesLayoutPath[audience], "layout");
    return { ok: true, message: "Marked As Read.", conversationId };
}

export async function listMessageCandidates(
    audience: MessageAudience,
    search: string,
): Promise<MessageCandidate[]> {
    return getMessageCandidates(audience, search);
}

export async function openInstructorConversation(
    instructorSlug: string,
    courseId: string,
): Promise<MessageActionResult> {
    const instructor = await db.instructor.findUnique({
        where: { slug: instructorSlug },
        select: { userId: true },
    });
    if (!instructor?.userId) {
        return {
            ok: false,
            message: "This Instructor Can't Receive Messages Yet.",
        };
    }
    return startConversation("LEARNER", instructor.userId, courseId);
}
