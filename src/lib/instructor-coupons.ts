import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInstructorProfile } from "@/lib/instructor";
import {
    COUPONS_PAGE_SIZE,
    couponTabValues,
    type CouponStatus,
    type CouponTab,
} from "@/lib/config/instructor-coupons";
import type { Prisma, PromotionDiscountType } from "@/generated/prisma/client";

export type CouponsQuery = {
    tab: CouponTab;
    courseId: string | null;
    page: number;
};

export type CouponRow = {
    id: string;
    code: string;
    courseId: string;
    courseTitle: string;
    discountType: PromotionDiscountType;
    percentOff: number;
    priceCents: number;
    listPriceCents: number;
    redemptionLimit: number | null;
    redemptions: number;
    revenueCents: number;
    status: CouponStatus;
    startsAt: Date;
    endsAt: Date | null;
};

export type CouponCourse = {
    id: string;
    title: string;
    priceCents: number;
    listPriceCents: number;
};

export type CouponsPage = {
    rows: CouponRow[];
    courses: CouponCourse[];
    total: number;
    page: number;
    pageCount: number;
    query: CouponsQuery;
    stats: {
        activeCount: number;
        redemptions: number;
        revenueCents: number;
        averageDiscount: number | null;
    };
    generatedAt: Date;
};

export function parseCouponsQuery(params: {
    tab?: string | string[];
    course?: string | string[];
    page?: string | string[];
}): CouponsQuery {
    const one = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawTab = one(params.tab);
    const rawCourse = (one(params.course) ?? "").trim();
    const rawPage = Number(one(params.page));

    return {
        tab:
            rawTab && couponTabValues.has(rawTab)
                ? (rawTab as CouponTab)
                : "all",
        courseId: rawCourse === "" ? null : rawCourse.slice(0, 64),
        page:
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1,
    };
}

function statusOf(
    coupon: { startsAt: Date; endsAt: Date | null },
    now: Date,
): CouponStatus {
    if (coupon.startsAt > now) return "scheduled";
    if (coupon.endsAt && coupon.endsAt < now) return "expired";
    return "active";
}

function tabWhere(tab: CouponTab, now: Date): Prisma.CouponWhereInput {
    if (tab === "scheduled") return { startsAt: { gt: now } };
    if (tab === "expired") return { endsAt: { lt: now } };
    if (tab === "active") {
        return {
            startsAt: { lte: now },
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        };
    }
    return {};
}

export async function getCouponsPage(
    query: CouponsQuery,
): Promise<CouponsPage | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const now = new Date();
    const mine: Prisma.CouponWhereInput = { instructorId: profile.id };

    const where: Prisma.CouponWhereInput = {
        ...mine,
        ...tabWhere(query.tab, now),
        ...(query.courseId ? { courseId: query.courseId } : {}),
    };

    const [total, all, courses] = await Promise.all([
        db.coupon.count({ where }),
        db.coupon.findMany({
            where: mine,
            orderBy: [{ createdAt: "desc" }, { code: "asc" }],
            select: COUPON_ROW_SELECT,
        }),
        db.course.findMany({
            where: { instructorId: profile.id },
            orderBy: { title: "asc" },
            select: {
                id: true,
                title: true,
                priceCents: true,
                listPriceCents: true,
            },
        }),
    ]);

    const enriched = sortCouponRows(
        all.map((coupon) => toCouponRow(coupon, now)),
    );
    const stats = couponStatsOf(enriched);

    const filtered = enriched.filter((row) => {
        if (query.courseId && row.courseId !== query.courseId) return false;
        if (query.tab === "all") return true;
        return row.status === query.tab;
    });

    const pageCount = Math.max(1, Math.ceil(total / COUPONS_PAGE_SIZE));
    const page = Math.min(query.page, pageCount);
    const rows = filtered.slice(
        (page - 1) * COUPONS_PAGE_SIZE,
        page * COUPONS_PAGE_SIZE,
    );

    return {
        rows,
        courses,
        total,
        page,
        pageCount,
        query: { ...query, page },
        stats,
        generatedAt: now,
    };
}

const COUPON_ROW_SELECT = {
    id: true,
    code: true,
    courseId: true,
    discountType: true,
    percentOff: true,
    resultingPriceCents: true,
    redemptionLimit: true,
    startsAt: true,
    endsAt: true,
    course: { select: { title: true, listPriceCents: true } },
    _count: { select: { redemptions: true } },
} satisfies Prisma.CouponSelect;

type CouponRecord = Prisma.CouponGetPayload<{
    select: typeof COUPON_ROW_SELECT;
}>;

function toCouponRow(coupon: CouponRecord, now: Date): CouponRow {
    const redemptions = coupon._count.redemptions;
    return {
        id: coupon.id,
        code: coupon.code,
        courseId: coupon.courseId,
        courseTitle: coupon.course.title,
        discountType: coupon.discountType,
        percentOff: coupon.percentOff,
        priceCents: coupon.resultingPriceCents,
        listPriceCents: coupon.course.listPriceCents,
        redemptionLimit: coupon.redemptionLimit,
        redemptions,
        revenueCents: redemptions * coupon.resultingPriceCents,
        status: statusOf(coupon, now),
        startsAt: coupon.startsAt,
        endsAt: coupon.endsAt,
    };
}

function sortCouponRows(rows: CouponRow[]): CouponRow[] {
    const statusRank: Record<CouponStatus, number> = {
        active: 0,
        scheduled: 1,
        expired: 2,
    };
    return rows
        .slice()
        .sort(
            (a, b) =>
                statusRank[a.status] - statusRank[b.status] ||
                b.startsAt.getTime() - a.startsAt.getTime() ||
                a.code.localeCompare(b.code),
        );
}

function couponStatsOf(rows: CouponRow[]): CouponsPage["stats"] {
    const redemptions = rows.reduce((sum, row) => sum + row.redemptions, 0);
    return {
        activeCount: rows.filter((row) => row.status === "active").length,
        redemptions,
        revenueCents: rows.reduce((sum, row) => sum + row.revenueCents, 0),
        averageDiscount:
            redemptions === 0
                ? null
                : Math.round(
                      rows.reduce(
                          (sum, row) => sum + row.percentOff * row.redemptions,
                          0,
                      ) / redemptions,
                  ),
    };
}

export type CourseCoupons = {
    rows: CouponRow[];
    course: CouponCourse;
    stats: CouponsPage["stats"];
    revenueShareBps: number;
    generatedAt: Date;
};

export async function getCourseCoupons(
    courseId: string,
    revenueShareBps: number,
): Promise<CourseCoupons | null> {
    const session = await getSession();
    if (!session) return null;

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return null;

    const now = new Date();
    const [course, coupons] = await Promise.all([
        db.course.findFirst({
            where: { id: courseId, instructorId: profile.id },
            select: {
                id: true,
                title: true,
                priceCents: true,
                listPriceCents: true,
            },
        }),
        db.coupon.findMany({
            where: { courseId, instructorId: profile.id },
            orderBy: [{ createdAt: "desc" }, { code: "asc" }],
            select: COUPON_ROW_SELECT,
        }),
    ]);
    if (!course) return null;

    const rows = sortCouponRows(
        coupons.map((coupon) => toCouponRow(coupon, now)),
    );
    return {
        rows,
        course,
        stats: couponStatsOf(rows),
        revenueShareBps,
        generatedAt: now,
    };
}
