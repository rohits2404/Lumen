import { db } from "@/lib/db";
import {
    PARTICIPATION_PAGE_SIZE,
    PAST_PROMOTIONS_LIMIT,
} from "@/lib/config/admin-promotions";
import type {
    Prisma,
    PromotionDiscountType,
    PromotionScope,
} from "@/generated/prisma/client";

export type PromotionState = "LIVE" | "SCHEDULED";

type PromotionBase = {
    id: string;
    name: string;
    discountType: PromotionDiscountType;
    value: number;
    scope: PromotionScope;
    categoryIds: string[];
    categoryNames: string[];
    redemptionCount: number;
    revenueCents: number;
};

export type ActivePromotion = PromotionBase & {
    state: PromotionState;
    startsAt: Date;
    endsAt: Date;
    forceOnAllCourses: boolean;
    coursesIncluded: number;
    coursesOptedOut: number;
};

export type PastPromotion = PromotionBase & { endsAt: Date };

export type ParticipationRow = {
    instructorId: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    courseCount: number;
    studentsCount: number;
    participating: boolean;
};

export type ParticipationPage = {
    rows: ParticipationRow[];
    total: number;
    page: number;
    pageCount: number;
};

export type PromotionCategory = { id: string; name: string };

export type PromotionsQuery = { page: number };

export function parsePromotionsQuery(params: {
    page?: string | string[];
}): PromotionsQuery {
    const raw = Array.isArray(params.page) ? params.page[0] : params.page;
    const page = Number(raw);
    return { page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1 };
}

const promotionSelect = {
    id: true,
    name: true,
    discountType: true,
    value: true,
    scope: true,
    startsAt: true,
    endsAt: true,
    forceOnAllCourses: true,
    redemptionCount: true,
    revenueCents: true,
    categories: { select: { id: true, name: true }, orderBy: { order: "asc" } },
} satisfies Prisma.PromotionSelect;

type PromotionRecord = Prisma.PromotionGetPayload<{
    select: typeof promotionSelect;
}>;

function toBase(row: PromotionRecord): PromotionBase {
    return {
        id: row.id,
        name: row.name,
        discountType: row.discountType,
        value: row.value,
        scope: row.scope,
        categoryIds: row.categories.map((category) => category.id),
        categoryNames: row.categories.map((category) => category.name),
        redemptionCount: row.redemptionCount,
        revenueCents: row.revenueCents,
    };
}

async function inScopeCourseFilter(
    promotion: Pick<PromotionBase, "scope" | "categoryIds">,
): Promise<Prisma.CourseWhereInput> {
    if (promotion.scope === "ALL_COURSES") return { status: "PUBLISHED" };

    const children = await db.category.findMany({
        where: { parentId: { in: promotion.categoryIds } },
        select: { id: true },
    });

    return {
        status: "PUBLISHED",
        categoryId: {
            in: [...promotion.categoryIds, ...children.map((row) => row.id)],
        },
    };
}

async function countCourses(
    promotion: Pick<PromotionBase, "scope" | "categoryIds"> & {
        forceOnAllCourses: boolean;
    },
): Promise<{ coursesIncluded: number; coursesOptedOut: number }> {
    const inScope = await inScopeCourseFilter(promotion);
    const total = await db.course.count({ where: inScope });

    if (promotion.forceOnAllCourses) {
        return { coursesIncluded: total, coursesOptedOut: 0 };
    }

    const optedOut = await db.course.count({
        where: {
            ...inScope,
            OR: [
                { promotionOptIn: false },
                { promotionOptIn: null, instructor: { promotionOptIn: false } },
            ],
        },
    });

    return { coursesIncluded: total - optedOut, coursesOptedOut: optedOut };
}

export async function getActivePromotions(
    now = new Date(),
): Promise<ActivePromotion[]> {
    const rows = await db.promotion.findMany({
        where: { endsAt: { gt: now } },
        orderBy: { startsAt: "asc" },
        select: promotionSelect,
    });

    return Promise.all(
        rows.map(async (row) => {
            const base = toBase(row);
            return {
                ...base,
                state: (row.startsAt <= now
                    ? "LIVE"
                    : "SCHEDULED") as PromotionState,
                startsAt: row.startsAt,
                endsAt: row.endsAt,
                forceOnAllCourses: row.forceOnAllCourses,
                ...(await countCourses({
                    ...base,
                    forceOnAllCourses: row.forceOnAllCourses,
                })),
            };
        }),
    );
}

export async function getPastPromotions(
    now = new Date(),
): Promise<PastPromotion[]> {
    const rows = await db.promotion.findMany({
        where: { endsAt: { lte: now } },
        orderBy: { endsAt: "desc" },
        take: PAST_PROMOTIONS_LIMIT,
        select: promotionSelect,
    });
    return rows.map((row) => ({ ...toBase(row), endsAt: row.endsAt }));
}

export async function getInstructorParticipation(
    query: PromotionsQuery,
): Promise<ParticipationPage> {
    const total = await db.instructor.count();
    const pageCount = Math.max(1, Math.ceil(total / PARTICIPATION_PAGE_SIZE));
    const page = Math.min(query.page, pageCount);

    const rows = await db.instructor.findMany({
        orderBy: [{ studentsCount: "desc" }, { name: "asc" }],
        skip: (page - 1) * PARTICIPATION_PAGE_SIZE,
        take: PARTICIPATION_PAGE_SIZE,
        select: {
            id: true,
            slug: true,
            name: true,
            imageUrl: true,
            studentsCount: true,
            promotionOptIn: true,
            _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
        },
    });

    return {
        rows: rows.map((row) => ({
            instructorId: row.id,
            slug: row.slug,
            name: row.name,
            imageUrl: row.imageUrl,
            courseCount: row._count.courses,
            studentsCount: row.studentsCount,
            participating: row.promotionOptIn,
        })),
        total,
        page,
        pageCount,
    };
}

export async function getPromotionCategories(): Promise<PromotionCategory[]> {
    return db.category.findMany({
        where: { parentId: null },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
    });
}
