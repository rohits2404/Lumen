"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    getModeratorCandidates,
    getTopicModerators,
    type ModeratorCandidate,
    type TopicModeratorRow,
} from "@/lib/admin/community";
import {
    isTopicVisibility,
    TOPIC_DESCRIPTION_MAX_LENGTH,
    TOPIC_NAME_MAX_LENGTH,
} from "@/lib/config/admin-community";
import { isCategoryAccent } from "@/lib/config/admin-categories";
import type { TopicVisibility } from "@/generated/prisma/client";

export type AdminCommunityResult = { ok: boolean; message: string };

const DENIED: AdminCommunityResult = {
    ok: false,
    message: "You Do Not Have Access To The Community Console.",
};

const GONE: AdminCommunityResult = {
    ok: false,
    message: "That Topic No Longer Exists — Reload The Page.",
};

async function requireAdmin() {
    const session = await getSession();
    if (session?.user.role !== "admin") return null;
    return session;
}

function revalidateConsole() {
    revalidatePath("/dashboard/admin", "layout");
}

export type TopicInput = {
    name: string;
    description: string;
    accentColor: string;
    visibility: string;
    learnersCanStartThreads: boolean;
    requiresModeratorApproval: boolean;
};

function slugify(name: string) {
    return (
        name
            .toLowerCase()
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "topic"
    );
}

function clean(input: TopicInput) {
    const name = (input?.name ?? "").trim().slice(0, TOPIC_NAME_MAX_LENGTH);
    const description = (input?.description ?? "")
        .trim()
        .slice(0, TOPIC_DESCRIPTION_MAX_LENGTH);
    const visibility: TopicVisibility = isTopicVisibility(input?.visibility)
        ? input.visibility
        : "EVERYONE";
    const accentColor = isCategoryAccent(input?.accentColor)
        ? input.accentColor
        : "blue";
    return {
        name,
        description,
        accentColor,
        visibility,
        learnersCanStartThreads: input?.learnersCanStartThreads !== false,
        requiresModeratorApproval: input?.requiresModeratorApproval === true,
    };
}

async function uniqueSlug(base: string) {
    let slug = base;
    let n = 2;
    while (await db.communityTopic.findUnique({ where: { slug } })) {
        slug = `${base}-${n}`;
        n += 1;
    }
    return slug;
}

async function log(
    session: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>,
    action: string,
    topicId: string,
    topicName: string,
) {
    await db.auditLog.create({
        data: {
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role ?? null,
            action,
            targetType: "community_topic",
            targetId: topicId,
            targetLabel: topicName,
            category: "COURSES",
        },
    });
}

export async function createTopic(
    input: TopicInput,
): Promise<AdminCommunityResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const values = clean(input);
    if (values.name.length === 0) {
        return { ok: false, message: "Give The Topic a Name." };
    }

    const last = await db.communityTopic.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
    });

    const topic = await db.communityTopic.create({
        data: {
            ...values,
            slug: await uniqueSlug(slugify(values.name)),
            order: (last?.order ?? -1) + 1,
        },
        select: { id: true, name: true },
    });

    await log(session, "Created a Community Topic", topic.id, topic.name);
    revalidateConsole();
    return { ok: true, message: `${topic.name} Was Created` };
}

export async function updateTopic(
    topicId: string,
    input: TopicInput,
): Promise<AdminCommunityResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const existing = await db.communityTopic.findUnique({
        where: { id: topicId },
        select: { id: true },
    });
    if (!existing) return GONE;

    const values = clean(input);
    if (values.name.length === 0) {
        return { ok: false, message: "Give The Topic a Name." };
    }

    const topic = await db.communityTopic.update({
        where: { id: existing.id },
        data: values,
        select: { id: true, name: true },
    });

    await log(session, "Updated a Community Topic", topic.id, topic.name);
    revalidateConsole();
    return { ok: true, message: `${topic.name} Was Updated` };
}

export async function deleteTopic(
    topicId: string,
): Promise<AdminCommunityResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const topic = await db.communityTopic.findUnique({
        where: { id: topicId },
        select: {
            id: true,
            name: true,
            _count: { select: { discussions: true } },
        },
    });
    if (!topic) return GONE;

    if (topic._count.discussions > 0) {
        return {
            ok: false,
            message: `${topic.name} Still Has ${topic._count.discussions.toLocaleString(
                "en-US",
            )} ${topic._count.discussions === 1 ? "Thread" : "Threads"} — Move Or Remove Them First.`,
        };
    }

    await db.communityTopic.delete({ where: { id: topic.id } });
    await log(session, "Deleted a Community Topic", topic.id, topic.name);
    revalidateConsole();
    return { ok: true, message: `${topic.name} Was Deleted` };
}

export type ModeratorDraft = {
    userId: string;
    canPin: boolean;
    canLock: boolean;
    canDelete: boolean;
    canSuspend: boolean;
};

export async function loadTopicModerators(topicId: string): Promise<{
    moderators: TopicModeratorRow[];
    candidates: ModeratorCandidate[];
} | null> {
    const session = await requireAdmin();
    if (!session) return null;
    const [moderators, candidates] = await Promise.all([
        getTopicModerators(topicId),
        getModeratorCandidates(topicId, ""),
    ]);
    return { moderators, candidates };
}

export async function searchModeratorCandidates(
    topicId: string,
    search: string,
): Promise<ModeratorCandidate[]> {
    const session = await requireAdmin();
    if (!session) return [];
    return getModeratorCandidates(topicId, search);
}

export async function saveTopicModerators(
    topicId: string,
    drafts: ModeratorDraft[],
): Promise<AdminCommunityResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const topic = await db.communityTopic.findUnique({
        where: { id: topicId },
        select: { id: true, name: true },
    });
    if (!topic) return GONE;

    const wanted = Array.isArray(drafts) ? drafts : [];
    const ids = [
        ...new Set(
            wanted.map((row) => row?.userId).filter((id): id is string => !!id),
        ),
    ];

    const real = await db.user.findMany({
        where: { id: { in: ids }, status: "ACTIVE" },
        select: { id: true },
    });
    const allowed = new Set(real.map((row) => row.id));

    const byUser = new Map(
        wanted
            .filter((row) => allowed.has(row.userId))
            .map((row) => [
                row.userId,
                {
                    canPin: row.canPin === true,
                    canLock: row.canLock === true,
                    canDelete: row.canDelete === true,
                    canSuspend: row.canSuspend === true,
                },
            ]),
    );

    const current = await db.topicModerator.findMany({
        where: { topicId: topic.id },
        select: { id: true, userId: true },
    });
    const currentIds = new Set(current.map((row) => row.userId));

    const removed = current.filter((row) => !byUser.has(row.userId));
    const added = [...byUser.entries()].filter(([id]) => !currentIds.has(id));
    const updated = [...byUser.entries()].filter(([id]) => currentIds.has(id));

    await db.$transaction([
        ...(removed.length > 0
            ? [
                  db.topicModerator.deleteMany({
                      where: { id: { in: removed.map((row) => row.id) } },
                  }),
              ]
            : []),
        ...added.map(([userId, permissions]) =>
            db.topicModerator.create({
                data: { topicId: topic.id, userId, ...permissions },
            }),
        ),
        ...updated.map(([userId, permissions]) =>
            db.topicModerator.update({
                where: { topicId_userId: { topicId: topic.id, userId } },
                data: permissions,
            }),
        ),
        db.auditLog.create({
            data: {
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role ?? null,
                action: "Updated Topic Moderators",
                targetType: "community_topic",
                targetId: topic.id,
                targetLabel: topic.name,
                category: "SECURITY",
            },
        }),
    ]);

    revalidateConsole();
    return { ok: true, message: `Moderators For ${topic.name} Were Saved` };
}
