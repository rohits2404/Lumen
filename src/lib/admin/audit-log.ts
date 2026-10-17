import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const AUDIT_PAGE_SIZE = 10;
export const AUDIT_EXPORT_LIMIT = 5000;

export type AuditCategory = "MEMBERS" | "COURSES" | "BILLING" | "SECURITY";

export type AuditTab = "all" | Lowercase<AuditCategory>;

export type AuditQuery = {
    tab: AuditTab;
    query: string;
    page: number;
};

export type AuditEntry = {
    id: string;
    actorName: string;
    actorRole: string | null;
    actorImage: string | null;
    action: string;
    targetLabel: string | null;
    targetType: string | null;
    category: AuditCategory;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
};

export type AuditPage = {
    entries: AuditEntry[];
    total: number;
    page: number;
    pageCount: number;
    counts: Record<AuditTab, number>;
    generatedAt: Date;
};

export function parseAuditQuery(params: {
    tab?: string | string[];
    q?: string | string[];
    page?: string | string[];
}): AuditQuery {
    const first = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const tab = first(params.tab);
    const page = Number(first(params.page));

    return {
        tab: isAuditTab(tab) ? tab : "all",
        query: (first(params.q) ?? "").trim().slice(0, 100),
        page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
    };
}

const AUDIT_TABS: AuditTab[] = [
    "all",
    "members",
    "courses",
    "billing",
    "security",
];

function isAuditTab(value: unknown): value is AuditTab {
    return typeof value === "string" && AUDIT_TABS.includes(value as AuditTab);
}

function auditWhere({ tab, query }: Pick<AuditQuery, "tab" | "query">) {
    const where: Prisma.AuditLogWhereInput = {};

    if (tab !== "all") {
        where.category = tab.toUpperCase() as AuditCategory;
    }

    if (query) {
        where.OR = [
            { actorName: { contains: query, mode: "insensitive" } },
            { action: { contains: query, mode: "insensitive" } },
            { targetLabel: { contains: query, mode: "insensitive" } },
            { ipAddress: { contains: query, mode: "insensitive" } },
        ];
    }

    return where;
}

const AUDIT_SELECT = {
    id: true,
    actorName: true,
    actorRole: true,
    action: true,
    targetLabel: true,
    targetType: true,
    category: true,
    ipAddress: true,
    userAgent: true,
    createdAt: true,
    actor: { select: { image: true } },
} satisfies Prisma.AuditLogSelect;

function toEntry(row: {
    actor: { image: string | null } | null;
    category: string;
    actorRole: string | null;
    [key: string]: unknown;
}): AuditEntry {
    const { actor, ...rest } = row;
    return {
        ...(rest as Omit<AuditEntry, "actorImage">),
        actorImage: actor?.image ?? null,
    };
}

export const getAuditPage = cache(async function getAuditPage(
    input: AuditQuery,
): Promise<AuditPage> {
    const where = auditWhere(input);

    const [total, counts, rows] = await Promise.all([
        db.auditLog.count({ where }),
        db.auditLog.groupBy({
            by: ["category"],
            where: auditWhere({ tab: "all", query: input.query }),
            _count: { _all: true },
        }),
        db.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (input.page - 1) * AUDIT_PAGE_SIZE,
            take: AUDIT_PAGE_SIZE,
            select: AUDIT_SELECT,
        }),
    ]);

    const byCategory = new Map(
        counts.map((row) => [row.category as AuditCategory, row._count._all]),
    );

    return {
        entries: rows.map(toEntry),
        generatedAt: new Date(),
        total,
        page: input.page,
        pageCount: Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE)),
        counts: {
            all: counts.reduce((sum, row) => sum + row._count._all, 0),
            members: byCategory.get("MEMBERS") ?? 0,
            courses: byCategory.get("COURSES") ?? 0,
            billing: byCategory.get("BILLING") ?? 0,
            security: byCategory.get("SECURITY") ?? 0,
        },
    };
});

export async function getAuditExport(
    input: Pick<AuditQuery, "tab" | "query">,
): Promise<AuditEntry[]> {
    const rows = await db.auditLog.findMany({
        where: auditWhere(input),
        orderBy: { createdAt: "desc" },
        take: AUDIT_EXPORT_LIMIT,
        select: AUDIT_SELECT,
    });

    return rows.map(toEntry);
}
