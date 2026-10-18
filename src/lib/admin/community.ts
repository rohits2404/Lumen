import { cache } from "react";

import { db } from "@/lib/db";
import { MODERATORS_PAGE_SIZE } from "@/lib/config/admin-community";
import type { TopicVisibility } from "@/generated/prisma/client";

export type CommunityStats = {
    topics: number;
    threads: number;
    moderators: number;
    reportedItems: number;
};

export type TopicRow = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    accentColor: string;
    visibility: TopicVisibility;
    learnersCanStartThreads: boolean;
    requiresModeratorApproval: boolean;
    threadCount: number;
    postCount: number;
    moderatorCount: number;
};

export type ModeratorRow = {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    topics: { id: string; name: string }[];
    canPin: boolean;
    canLock: boolean;
    canDelete: boolean;
    canSuspend: boolean;
};

export type ModeratorsPage = {
    rows: ModeratorRow[];
    total: number;
    page: number;
    pageCount: number;
};

export type TopicModeratorRow = {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    canPin: boolean;
    canLock: boolean;
    canDelete: boolean;
    canSuspend: boolean;
};

export type ModeratorCandidate = {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    courseCount: number;
};

export type CommunityQuery = { page: number };

export function parseCommunityQuery(params: {
    page?: string | string[];
}): CommunityQuery {
    const raw = Array.isArray(params.page) ? params.page[0] : params.page;
    const page = Number(raw);
    return { page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1 };
}

export const getCommunityStats = cache(async (): Promise<CommunityStats> => {
    const [topics, threads, moderators, reportedItems] = await Promise.all([
        db.communityTopic.count(),
        db.discussion.count({ where: { status: { not: "REMOVED" } } }),
        db.topicModerator.findMany({
            distinct: ["userId"],
            select: { userId: true },
        }),
        db.contentReport.count({
            where: {
                status: "OPEN",
                targetType: { in: ["DISCUSSION", "DISCUSSION_REPLY"] },
            },
        }),
    ]);

    return {
        topics,
        threads,
        moderators: moderators.length,
        reportedItems,
    };
});

export async function getTopics(): Promise<TopicRow[]> {
    const [topics, replies] = await Promise.all([
        db.communityTopic.findMany({
            orderBy: [{ order: "asc" }, { name: "asc" }],
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                accentColor: true,
                visibility: true,
                learnersCanStartThreads: true,
                requiresModeratorApproval: true,
                _count: { select: { moderators: true } },
            },
        }),
        db.discussion.groupBy({
            by: ["topicId"],
            where: { status: { not: "REMOVED" } },
            _count: { _all: true },
            _sum: { replyCount: true },
        }),
    ]);

    const byTopic = new Map(replies.map((row) => [row.topicId, row]));

    return topics.map((topic) => {
        const counts = byTopic.get(topic.id);
        const threadCount = counts?._count._all ?? 0;
        return {
            id: topic.id,
            slug: topic.slug,
            name: topic.name,
            description: topic.description,
            accentColor: topic.accentColor,
            visibility: topic.visibility,
            learnersCanStartThreads: topic.learnersCanStartThreads,
            requiresModeratorApproval: topic.requiresModeratorApproval,
            threadCount,
            postCount: threadCount + (counts?._sum.replyCount ?? 0),
            moderatorCount: topic._count.moderators,
        };
    });
}

export async function getModerators(
    query: CommunityQuery,
    topicOrder: string[],
): Promise<ModeratorsPage> {
    const rows = await db.topicModerator.findMany({
        select: {
            topicId: true,
            canPin: true,
            canLock: true,
            canDelete: true,
            canSuspend: true,
            topic: { select: { id: true, name: true } },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                },
            },
        },
    });

    const rank = new Map(topicOrder.map((id, index) => [id, index]));
    const byUser = new Map<string, ModeratorRow>();

    for (const row of rows) {
        const existing = byUser.get(row.user.id);
        if (existing) {
            existing.topics.push({ id: row.topic.id, name: row.topic.name });
            existing.canPin ||= row.canPin;
            existing.canLock ||= row.canLock;
            existing.canDelete ||= row.canDelete;
            existing.canSuspend ||= row.canSuspend;
            continue;
        }
        byUser.set(row.user.id, {
            userId: row.user.id,
            name: row.user.name,
            email: row.user.email,
            image: row.user.image,
            role: row.user.role,
            topics: [{ id: row.topic.id, name: row.topic.name }],
            canPin: row.canPin,
            canLock: row.canLock,
            canDelete: row.canDelete,
            canSuspend: row.canSuspend,
        });
    }

    const all = [...byUser.values()];
    for (const row of all) {
        row.topics.sort(
            (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
        );
    }
    all.sort((a, b) => a.name.localeCompare(b.name));

    const total = all.length;
    const pageCount = Math.max(1, Math.ceil(total / MODERATORS_PAGE_SIZE));
    const page = Math.min(query.page, pageCount);
    const from = (page - 1) * MODERATORS_PAGE_SIZE;

    return {
        rows: all.slice(from, from + MODERATORS_PAGE_SIZE),
        total,
        page,
        pageCount,
    };
}

export async function getTopicModerators(
    topicId: string,
): Promise<TopicModeratorRow[]> {
    const rows = await db.topicModerator.findMany({
        where: { topicId },
        orderBy: { createdAt: "asc" },
        select: {
            canPin: true,
            canLock: true,
            canDelete: true,
            canSuspend: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                },
            },
        },
    });

    return rows.map((row) => ({
        userId: row.user.id,
        name: row.user.name,
        email: row.user.email,
        image: row.user.image,
        role: row.user.role,
        canPin: row.canPin,
        canLock: row.canLock,
        canDelete: row.canDelete,
        canSuspend: row.canSuspend,
    }));
}

const CANDIDATE_LIMIT = 8;

export async function getModeratorCandidates(
    topicId: string,
    search: string,
): Promise<ModeratorCandidate[]> {
    const term = search.trim().slice(0, 80);
    const already = await db.topicModerator.findMany({
        where: { topicId },
        select: { userId: true },
    });

    const users = await db.user.findMany({
        where: {
            id: { notIn: already.map((row) => row.userId) },
            status: "ACTIVE",
            ...(term
                ? {
                      OR: [
                          {
                              name: {
                                  contains: term,
                                  mode: "insensitive" as const,
                              },
                          },
                          {
                              email: {
                                  contains: term,
                                  mode: "insensitive" as const,
                              },
                          },
                      ],
                  }
                : {}),
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        take: CANDIDATE_LIMIT,
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            instructorProfile: {
                select: { _count: { select: { courses: true } } },
            },
        },
    });

    return users.map((user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        courseCount: user.instructorProfile?._count.courses ?? 0,
    }));
}
