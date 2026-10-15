import { cache } from "react";

import { db } from "@/lib/db";
import { ENTITLED_STATUSES } from "@/lib/subscription";
import { USERS_PAGE_SIZE } from "@/lib/config/admin-users";
import type { Prisma, UserStatus } from "@/generated/prisma/client";

export type UsersTab =
    "all" | "students" | "instructors" | "admins" | "pending-instructors";

export type UserPlan = "free" | "business";

export type UsersQuery = {
    tab: UsersTab;
    query: string;
    statuses: UserStatus[];
    plan: UserPlan | null;
    page: number;
};

export type UserRow = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    plan: UserPlan;
    country: string | null;
    status: UserStatus;
    instructorSlug: string | null;
};

export type UsersPage = {
    rows: UserRow[];
    total: number;
    page: number;
    pageCount: number;
    counts: Record<UsersTab, number>;
};

export type UserStats = {
    total: number;
    activeThisWeek: number;
    instructors: number;
    newThisMonth: number;
};

const DAY = 24 * 60 * 60 * 1000;

const USER_STATUSES: UserStatus[] = [
    "ACTIVE",
    "PENDING",
    "INACTIVE",
    "SUSPENDED",
];

const USERS_TABS: UsersTab[] = [
    "all",
    "students",
    "instructors",
    "admins",
    "pending-instructors",
];

export function parseUsersQuery(params: {
    tab?: string | string[];
    q?: string | string[];
    status?: string | string[];
    plan?: string | string[];
    page?: string | string[];
}): UsersQuery {
    const first = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const tab = first(params.tab);
    const plan = first(params.plan);
    const page = Number(first(params.page));

    const statuses = (
        Array.isArray(params.status)
            ? params.status
            : (params.status ?? "").split(",")
    )
        .map((value) => value.trim().toUpperCase())
        .filter((value): value is UserStatus =>
            USER_STATUSES.includes(value as UserStatus),
        );

    return {
        tab: USERS_TABS.includes(tab as UsersTab) ? (tab as UsersTab) : "all",
        query: (first(params.q) ?? "").trim().slice(0, 100),
        statuses: [...new Set(statuses)],
        plan: plan === "free" || plan === "business" ? plan : null,
        page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
    };
}

const LIVE_SUBSCRIPTION = {
    status: { in: ENTITLED_STATUSES },
} satisfies Prisma.SubscriptionWhereInput;

function tabWhere(tab: UsersTab): Prisma.UserWhereInput {
    switch (tab) {
        case "students":
            return { OR: [{ role: "user" }, { role: null }] };
        case "instructors":
            return { role: "instructor" };
        case "admins":
            return { role: "admin" };
        case "pending-instructors":
            return { instructorApplications: { some: { status: "PENDING" } } };
        default:
            return {};
    }
}

function usersWhere(query: UsersQuery): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = { ...tabWhere(query.tab) };

    if (query.query) {
        where.OR = [
            { name: { contains: query.query, mode: "insensitive" } },
            { email: { contains: query.query, mode: "insensitive" } },
        ];
    }

    if (query.statuses.length > 0) {
        where.status = { in: query.statuses };
    }

    if (query.plan === "business") {
        where.subscriptions = { some: LIVE_SUBSCRIPTION };
    } else if (query.plan === "free") {
        where.subscriptions = { none: LIVE_SUBSCRIPTION };
    }

    return where;
}

function countsWhere(query: UsersQuery, tab: UsersTab): Prisma.UserWhereInput {
    return usersWhere({ ...query, tab });
}

export const getUsersPage = cache(async function getUsersPage(
    input: UsersQuery,
): Promise<UsersPage> {
    const where = usersWhere(input);

    const [total, rows, ...counts] = await Promise.all([
        db.user.count({ where }),
        db.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * USERS_PAGE_SIZE,
            take: USERS_PAGE_SIZE,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                country: true,
                status: true,
                subscriptions: {
                    where: LIVE_SUBSCRIPTION,
                    take: 1,
                    select: { id: true },
                },
                instructorProfile: { select: { slug: true } },
            },
        }),
        ...USERS_TABS.map((tab) =>
            db.user.count({ where: countsWhere(input, tab) }),
        ),
    ]);

    return {
        rows: rows.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            image: row.image,
            role: row.role,
            plan: row.subscriptions.length > 0 ? "business" : "free",
            country: row.country,
            status: row.status,
            instructorSlug: row.instructorProfile?.slug ?? null,
        })),
        total,
        page: input.page,
        pageCount: Math.max(1, Math.ceil(total / USERS_PAGE_SIZE)),
        counts: Object.fromEntries(
            USERS_TABS.map((tab, index) => [tab, counts[index] ?? 0]),
        ) as Record<UsersTab, number>,
    };
});

export async function getUserStats(): Promise<UserStats> {
    const now = Date.now();
    const weekAgo = new Date(now - 7 * DAY);
    const monthAgo = new Date(now - 30 * DAY);

    const [total, active, instructors, newThisMonth] = await Promise.all([
        db.user.count(),
        db.session
            .findMany({
                where: {
                    updatedAt: { gte: weekAgo },
                    expiresAt: { gt: new Date() },
                },
                distinct: ["userId"],
                select: { userId: true },
            })
            .then((rows) => rows.length),
        db.user.count({ where: { role: "instructor" } }),
        db.user.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    return { total, activeThisWeek: active, instructors, newThisMonth };
}
