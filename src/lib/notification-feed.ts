import { formatDistanceStrict } from "date-fns";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    FEED_PAGE_SIZE,
    FEED_SEARCH_MAX,
    feedCategories,
    feedCategoryValues,
    feedStatusValues,
    type FeedStatus,
} from "@/lib/config/notification-feed";
import type {
    NotificationActionState,
    NotificationAudience,
    NotificationCategory,
    Prisma,
} from "@/generated/prisma/client";

export type FeedActor = {
    name: string;
    image: string | null;
    initials: string;
};

export type FeedNotification = {
    id: string;
    category: NotificationCategory;
    title: string;
    body: string | null;
    age: string;
    unread: boolean;
    actor: FeedActor | null;
    action: { type: string; state: NotificationActionState } | null;
};

export type FeedCategoryCount = {
    value: NotificationCategory;
    count: number;
};

export type FeedPage = {
    rows: FeedNotification[];
    total: number;
    unread: number;
    counts: FeedCategoryCount[];
    page: number;
    pageCount: number;
    query: FeedQuery;
};

export type FeedQuery = {
    category: NotificationCategory | null;
    status: FeedStatus;
    search: string;
    page: number;
};

export function parseFeedQuery(
    audience: NotificationAudience,
    params: {
        cat?: string | string[];
        status?: string | string[];
        q?: string | string[];
        page?: string | string[];
    },
): FeedQuery {
    const allowed = feedCategoryValues(audience);
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawCat = one(params.cat);
    const rawStatus = one(params.status);
    const rawPage = Number(one(params.page));

    return {
        category:
            rawCat && allowed.has(rawCat)
                ? (rawCat as NotificationCategory)
                : null,
        status:
            rawStatus && feedStatusValues.has(rawStatus)
                ? (rawStatus as FeedStatus)
                : "all",
        search: (one(params.q) ?? "").trim().slice(0, FEED_SEARCH_MAX),
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

function categoriesFor(audience: NotificationAudience) {
    return feedCategories[audience].map((entry) => entry.value);
}

function searchFilter(search: string): Prisma.NotificationWhereInput {
    if (!search) return {};
    return {
        OR: [
            { title: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } },
        ],
    };
}

function initialsOf(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const [first, last] = [parts[0], parts[parts.length - 1]];
    return (
        first.charAt(0) + (parts.length > 1 ? last.charAt(0) : "")
    ).toUpperCase();
}

export async function getNotificationFeed(
    audience: NotificationAudience,
    query: FeedQuery,
): Promise<FeedPage | null> {
    const session = await getSession();
    if (!session) return null;

    const now = new Date();
    const categories = categoriesFor(audience);
    const base: Prisma.NotificationWhereInput = {
        userId: session.user.id,
        audience,
        category: { in: categories },
    };
    const searched = { ...base, ...searchFilter(query.search) };

    const where: Prisma.NotificationWhereInput = {
        ...searched,
        ...(query.category ? { category: query.category } : {}),
        ...(query.status === "unread" ? { readAt: null } : {}),
        ...(query.status === "read" ? { NOT: { readAt: null } } : {}),
    };

    const [total, unread, grouped] = await Promise.all([
        db.notification.count({ where }),
        db.notification.count({ where: { ...base, readAt: null } }),
        db.notification.groupBy({
            by: ["category"],
            where: { ...searched, readAt: null },
            _count: { _all: true },
        }),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / FEED_PAGE_SIZE));
    const page = Math.min(query.page, pageCount);

    const rows = await db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * FEED_PAGE_SIZE,
        take: FEED_PAGE_SIZE,
        select: {
            id: true,
            category: true,
            title: true,
            body: true,
            readAt: true,
            createdAt: true,
            actorId: true,
            action: { select: { actionType: true, state: true } },
        },
    });

    const actorIds = [
        ...new Set(rows.map((row) => row.actorId).filter((id) => id !== null)),
    ];
    const actors = actorIds.length
        ? await db.user.findMany({
              where: { id: { in: actorIds } },
              select: { id: true, name: true, image: true },
          })
        : [];
    const actorById = new Map(actors.map((actor) => [actor.id, actor]));

    return {
        rows: rows.map((row) => {
            const actor = row.actorId ? actorById.get(row.actorId) : undefined;
            return {
                id: row.id,
                category: row.category,
                title: row.title,
                body: row.body,
                age: `${formatDistanceStrict(row.createdAt, now)} ago`,
                unread: row.readAt === null,
                actor: actor
                    ? {
                          name: actor.name,
                          image: actor.image,
                          initials: initialsOf(actor.name),
                      }
                    : null,
                action: row.action
                    ? { type: row.action.actionType, state: row.action.state }
                    : null,
            };
        }),
        total,
        unread,
        counts: categories.map((value) => ({
            value,
            count:
                grouped.find((entry) => entry.category === value)?._count
                    ._all ?? 0,
        })),
        page,
        pageCount,
        query: { ...query, page },
    };
}

export async function getUnreadCount(
    audience: NotificationAudience,
): Promise<number> {
    const session = await getSession();
    if (!session) return 0;

    return db.notification.count({
        where: {
            userId: session.user.id,
            audience,
            category: { in: categoriesFor(audience) },
            readAt: null,
        },
    });
}
