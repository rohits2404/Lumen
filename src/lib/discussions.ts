import { cache } from "react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import { compactAgo } from "@/lib/relative-time";
import { initialsOf } from "@/lib/user";
import {
    DISCUSSIONS_PAGE_SIZE,
    discussionScopeValues,
    type DiscussionAudience,
    type DiscussionScope,
} from "@/lib/config/discussions";
import type { Prisma } from "@/generated/prisma/client";

export type DiscussionsQuery = {
    topic: string | null;
    scope: DiscussionScope;
    page: number;
};

export type DiscussionTopic = {
    id: string;
    slug: string;
    name: string;
    threadCount: number;
};

export type DiscussionRow = {
    id: string;
    title: string;
    body: string;
    topicName: string;
    tags: string[];
    isPinned: boolean;
    replyCount: number;
    likeCount: number;
    liked: boolean;
    age: string;
    author: {
        name: string;
        image: string | null;
        initials: string;
        role: string;
    };
};

export type DiscussionStats = {
    activeThreads: number;
    repliesThisMonth: number;
    awaitingReply: number;
    participants: number;
    needsModeration: number;
};

export type DiscussionsPage = {
    rows: DiscussionRow[];
    topics: DiscussionTopic[];
    total: number;
    page: number;
    pageCount: number;
    query: DiscussionsQuery;
    stats: DiscussionStats | null;
    canModerate: boolean;
};

export function parseDiscussionsQuery(params: {
    topic?: string | string[];
    scope?: string | string[];
    page?: string | string[];
}): DiscussionsQuery {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawScope = one(params.scope);
    const rawTopic = (one(params.topic) ?? "").trim();
    const rawPage = Number(one(params.page));

    return {
        topic: rawTopic === "" ? null : rawTopic.slice(0, 64),
        scope:
            rawScope && discussionScopeValues.has(rawScope)
                ? (rawScope as DiscussionScope)
                : "all",
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

function visibleTopics(canTeach: boolean): Prisma.CommunityTopicWhereInput {
    return canTeach ? {} : { visibility: { not: "STAFF_ONLY" } };
}

export async function getDiscussionsPage(
    audience: DiscussionAudience,
    query: DiscussionsQuery,
): Promise<DiscussionsPage | null> {
    const session = await getSession();
    if (!session) return null;

    const meId = session.user.id;
    const now = new Date();
    const profile = await getInstructorProfile(meId);
    const staff = audience === "INSTRUCTOR" || profile !== null;
    const topicWhere = visibleTopics(staff);

    const visible = await db.communityTopic.findMany({
        where: topicWhere,
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, slug: true, name: true },
    });
    const topicIds = visible.map((topic) => topic.id);

    const grouped = topicIds.length
        ? await db.discussion.groupBy({
              by: ["topicId"],
              where: {
                  status: "PUBLISHED",
                  deletedAt: null,
                  topicId: { in: topicIds },
              },
              _count: { _all: true },
          })
        : [];
    const countByTopic = new Map(
        grouped.map((entry) => [entry.topicId, entry._count._all]),
    );
    const topics: DiscussionTopic[] = visible.map((topic) => ({
        ...topic,
        threadCount: countByTopic.get(topic.id) ?? 0,
    }));

    const selected = query.topic
        ? topics.find((topic) => topic.slug === query.topic)
        : undefined;

    const reportedIds =
        query.scope === "reported" ? await reportedDiscussionIds(meId) : [];

    const base: Prisma.DiscussionWhereInput = {
        status: "PUBLISHED",
        deletedAt: null,
        topicId: selected ? selected.id : { in: topicIds },
    };
    const where: Prisma.DiscussionWhereInput = {
        ...base,
        ...(query.scope === "mine" ? { authorId: meId } : {}),
        ...(query.scope === "unanswered" ? { replyCount: 0 } : {}),
        ...(query.scope === "reported" ? { id: { in: reportedIds } } : {}),
    };

    const [total, rows, stats] = await Promise.all([
        db.discussion.count({ where }),
        db.discussion.findMany({
            where,
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
            skip: (Math.max(1, query.page) - 1) * DISCUSSIONS_PAGE_SIZE,
            take: DISCUSSIONS_PAGE_SIZE,
            select: {
                id: true,
                title: true,
                body: true,
                tags: true,
                isPinned: true,
                replyCount: true,
                likeCount: true,
                createdAt: true,
                topic: { select: { name: true } },
                author: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                    },
                },
            },
        }),
        audience === "INSTRUCTOR"
            ? instructorStats(meId, topicIds)
            : Promise.resolve(null),
    ]);

    const ids = rows.map((row) => row.id);
    const likes = ids.length
        ? await db.discussionLike.findMany({
              where: {
                  userId: meId,
                  targetType: "DISCUSSION",
                  targetId: { in: ids },
              },
              select: { targetId: true },
          })
        : [];
    const liked = new Set(likes.map((like) => like.targetId));

    const pageCount = Math.max(1, Math.ceil(total / DISCUSSIONS_PAGE_SIZE));

    return {
        rows: rows.map((row) => ({
            id: row.id,
            title: row.title,
            body: row.body,
            topicName: row.topic.name,
            tags: row.tags,
            isPinned: row.isPinned,
            replyCount: row.replyCount,
            likeCount: row.likeCount,
            liked: liked.has(row.id),
            age: compactAgo(row.createdAt, now),
            author: {
                name: row.author.name,
                image: row.author.image,
                initials: initialsOf(row.author.name, row.author.email),
                role: row.author.role ?? "user",
            },
        })),
        topics,
        total,
        page: Math.min(Math.max(1, query.page), pageCount),
        pageCount,
        query,
        stats,
        canModerate: staff,
    };
}

const reportedDiscussionIds = cache(async function reportedDiscussionIds(
    meId: string,
): Promise<string[]> {
    const seats = await db.topicModerator.findMany({
        where: { userId: meId },
        select: { topicId: true },
    });
    if (seats.length === 0) return [];

    const reports = await db.contentReport.findMany({
        where: {
            status: "OPEN",
            targetType: { in: ["DISCUSSION", "DISCUSSION_REPLY"] },
        },
        select: { targetType: true, targetId: true },
    });
    if (reports.length === 0) return [];

    const direct = reports
        .filter((row) => row.targetType === "DISCUSSION")
        .map((row) => row.targetId);
    const replyIds = reports
        .filter((row) => row.targetType === "DISCUSSION_REPLY")
        .map((row) => row.targetId);

    const viaReplies = replyIds.length
        ? await db.discussionReply.findMany({
              where: { id: { in: replyIds } },
              select: { discussionId: true },
          })
        : [];

    const candidates = [
        ...new Set([...direct, ...viaReplies.map((row) => row.discussionId)]),
    ];
    if (candidates.length === 0) return [];

    const rows = await db.discussion.findMany({
        where: {
            id: { in: candidates },
            status: "PUBLISHED",
            deletedAt: null,
            topicId: { in: seats.map((seat) => seat.topicId) },
        },
        select: { id: true },
    });
    return rows.map((row) => row.id);
});

async function instructorStats(
    meId: string,
    visibleTopicIds: string[],
): Promise<DiscussionStats> {
    const moderated = await db.topicModerator.findMany({
        where: { userId: meId, topicId: { in: visibleTopicIds } },
        select: { topicId: true },
    });
    const mine: Prisma.DiscussionWhereInput = {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
            { topicId: { in: moderated.map((row) => row.topicId) } },
            { authorId: meId },
        ],
    };

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [activeThreads, awaitingReply, participants, replies, reports] =
        await Promise.all([
            db.discussion.count({ where: { ...mine, isLocked: false } }),
            db.discussion.count({ where: { ...mine, replyCount: 0 } }),
            db.discussion
                .findMany({
                    where: mine,
                    select: { authorId: true },
                    distinct: ["authorId"],
                })
                .then((list) => list.length),
            db.discussion.aggregate({
                where: { ...mine, createdAt: { gte: monthStart } },
                _sum: { replyCount: true },
            }),
            reportedDiscussionIds(meId).then((ids) => ids.length),
        ]);

    return {
        activeThreads,
        repliesThisMonth: replies._sum.replyCount ?? 0,
        awaitingReply,
        participants,
        needsModeration: reports,
    };
}

export type DiscussionReplyRow = {
    id: string;
    body: string;
    age: string;
    likeCount: number;
    liked: boolean;
    fromStaff: boolean;
    author: DiscussionRow["author"];
};

export type DiscussionDetail = {
    id: string;
    title: string;
    paragraphs: string[];
    topicName: string;
    tags: string[];
    isPinned: boolean;
    isLocked: boolean;
    likeCount: number;
    liked: boolean;
    replyCount: number;
    age: string;
    author: DiscussionRow["author"];
    replies: DiscussionReplyRow[];
    canReply: boolean;
    me: { name: string; image: string | null; initials: string };
};

const THREAD_REPLY_LIMIT = 200;

export async function getDiscussionDetail(
    audience: DiscussionAudience,
    discussionId: string,
): Promise<DiscussionDetail | null> {
    const session = await getSession();
    if (!session) return null;

    const meId = session.user.id;
    const now = new Date();
    const profile = await getInstructorProfile(meId);
    const staff = audience === "INSTRUCTOR" || profile !== null;

    const row = await db.discussion.findFirst({
        where: {
            id: discussionId,
            status: "PUBLISHED",
            deletedAt: null,
            topic: visibleTopics(staff),
        },
        select: {
            id: true,
            title: true,
            body: true,
            tags: true,
            isPinned: true,
            isLocked: true,
            likeCount: true,
            replyCount: true,
            createdAt: true,
            topic: { select: { name: true } },
            author: {
                select: { name: true, email: true, image: true, role: true },
            },
            replies: {
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: THREAD_REPLY_LIMIT,
                select: {
                    id: true,
                    body: true,
                    likeCount: true,
                    createdAt: true,
                    author: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            role: true,
                        },
                    },
                },
            },
        },
    });
    if (!row) return null;

    const likes = await db.discussionLike.findMany({
        where: {
            userId: meId,
            OR: [
                { targetType: "DISCUSSION", targetId: row.id },
                {
                    targetType: "DISCUSSION_REPLY",
                    targetId: { in: row.replies.map((reply) => reply.id) },
                },
            ],
        },
        select: { targetId: true },
    });
    const liked = new Set(likes.map((like) => like.targetId));

    const person = (author: {
        name: string;
        email: string;
        image: string | null;
        role: string | null;
    }) => ({
        name: author.name,
        image: author.image,
        initials: initialsOf(author.name, author.email),
        role: author.role ?? "user",
    });

    return {
        id: row.id,
        title: row.title,
        paragraphs: row.body
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean),
        topicName: row.topic.name,
        tags: row.tags,
        isPinned: row.isPinned,
        isLocked: row.isLocked,
        likeCount: row.likeCount,
        liked: liked.has(row.id),
        replyCount: row.replyCount,
        age: compactAgo(row.createdAt, now),
        author: person(row.author),
        replies: row.replies.map((reply) => ({
            id: reply.id,
            body: reply.body,
            age: compactAgo(reply.createdAt, now),
            likeCount: reply.likeCount,
            liked: liked.has(reply.id),
            fromStaff:
                reply.author.role === "instructor" ||
                reply.author.role === "admin",
            author: person(reply.author),
        })),
        canReply: !row.isLocked,
        me: {
            name: session.user.name,
            image: session.user.image ?? null,
            initials: initialsOf(session.user.name, session.user.email),
        },
    };
}
