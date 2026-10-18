"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    isPromotionDiscountType,
    isPromotionScope,
    MAX_FIXED_PRICE_CENTS,
    MAX_PERCENT_OFF,
    MAX_PROMOTION_DAYS,
    MIN_FIXED_PRICE_CENTS,
    MIN_PERCENT_OFF,
    PROMOTION_NAME_MAX_LENGTH,
} from "@/lib/config/admin-promotions";
import type {
    PromotionDiscountType,
    PromotionScope,
} from "@/generated/prisma/client";

export type AdminPromotionsResult = { ok: boolean; message: string };

const DENIED: AdminPromotionsResult = {
    ok: false,
    message: "You Do Not Have Access To The Promotions Console.",
};

const GONE: AdminPromotionsResult = {
    ok: false,
    message: "That Promotion No Longer Exists — Reload The Page.",
};

const ENDED: AdminPromotionsResult = {
    ok: false,
    message: "That Promotion Has Already Ended — Reload The Page.",
};

async function requireAdmin() {
    const session = await getSession();
    if (session?.user.role !== "admin") return null;
    return session;
}

function revalidateConsole() {
    revalidatePath("/dashboard/admin", "layout");
}

async function log(
    session: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>,
    action: string,
    targetType: string,
    targetId: string,
    targetLabel: string,
) {
    await db.auditLog.create({
        data: {
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role ?? null,
            action,
            targetType,
            targetId,
            targetLabel,
            category: "BILLING",
        },
    });
}

export type PromotionInput = {
    name: string;
    discountType: string;
    value: number;
    scope: string;
    categoryIds: string[];
    startsOn: string | null;
    endsOn: string;
    forceOnAllCourses: boolean;
};

function dayStart(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    if (!match) return null;
    const date = new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    );
    return Number.isNaN(date.getTime()) ? null : date;
}

function dayEnd(value: string): Date | null {
    const start = dayStart(value);
    if (!start) return null;
    return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

type CleanPromotion = {
    name: string;
    discountType: PromotionDiscountType;
    value: number;
    scope: PromotionScope;
    categoryIds: string[];
    startsAt: Date;
    endsAt: Date;
    forceOnAllCourses: boolean;
};

async function clean(
    input: PromotionInput,
    now: Date,
): Promise<CleanPromotion | { error: string }> {
    const name = (input?.name ?? "").trim().slice(0, PROMOTION_NAME_MAX_LENGTH);
    if (name.length === 0) return { error: "Give The Promotion a Name." };

    if (!isPromotionDiscountType(input?.discountType)) {
        return { error: "Pick a Discount Type." };
    }
    const discountType = input.discountType;

    const value = Math.round(Number(input?.value));
    if (!Number.isFinite(value)) return { error: "Enter a Discount." };
    if (discountType === "PERCENT") {
        if (value < MIN_PERCENT_OFF || value > MAX_PERCENT_OFF) {
            return {
                error: `A Percentage Off Has To Be Between ${MIN_PERCENT_OFF} And ${MAX_PERCENT_OFF}.`,
            };
        }
    } else if (value < MIN_FIXED_PRICE_CENTS || value > MAX_FIXED_PRICE_CENTS) {
        return {
            error: `A Flat Sale Price Has To Be Between $${(
                MIN_FIXED_PRICE_CENTS / 100
            ).toFixed(2)} And $${(MAX_FIXED_PRICE_CENTS / 100).toFixed(2)}.`,
        };
    }

    if (!isPromotionScope(input?.scope))
        return { error: "Pick What It Applies To." };
    const scope = input.scope;

    let categoryIds: string[] = [];
    if (scope === "CATEGORIES") {
        const wanted = [
            ...new Set(
                (Array.isArray(input?.categoryIds)
                    ? input.categoryIds
                    : []
                ).filter(
                    (id): id is string =>
                        typeof id === "string" && id.length > 0,
                ),
            ),
        ];
        const real = await db.category.findMany({
            where: { id: { in: wanted } },
            select: { id: true },
        });
        categoryIds = real.map((row) => row.id);
        if (categoryIds.length === 0) {
            return { error: "Pick At Least One Category." };
        }
    }

    const startsAt = input?.startsOn ? dayStart(input.startsOn) : now;
    if (!startsAt) return { error: "That Start Date Isn't a Date." };

    const endsAt = dayEnd(input?.endsOn ?? "");
    if (!endsAt) return { error: "Pick The Day The Sale Ends." };
    if (endsAt <= startsAt) {
        return { error: "The Sale Has To End After It Starts." };
    }
    if (endsAt <= now) return { error: "Pick An End Date In The Future." };
    const days = (endsAt.getTime() - startsAt.getTime()) / 86_400_000;
    if (days > MAX_PROMOTION_DAYS) {
        return {
            error: `A Promotion Can Run For At Most ${MAX_PROMOTION_DAYS} Days.`,
        };
    }

    return {
        name,
        discountType,
        value,
        scope,
        categoryIds,
        startsAt,
        endsAt,
        forceOnAllCourses: input?.forceOnAllCourses === true,
    };
}

export async function createPromotion(
    input: PromotionInput,
): Promise<AdminPromotionsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const now = new Date();
    const values = await clean(input, now);
    if ("error" in values) return { ok: false, message: values.error };

    const promotion = await db.promotion.create({
        data: {
            name: values.name,
            discountType: values.discountType,
            value: values.value,
            scope: values.scope,
            startsAt: values.startsAt,
            endsAt: values.endsAt,
            forceOnAllCourses: values.forceOnAllCourses,
            categories: { connect: values.categoryIds.map((id) => ({ id })) },
        },
        select: { id: true, name: true, startsAt: true },
    });

    await log(
        session,
        "Launched platform promotion",
        "promotion",
        promotion.id,
        promotion.name,
    );
    revalidateConsole();
    return {
        ok: true,
        message:
            promotion.startsAt <= now
                ? `${promotion.name} Is Live`
                : `${promotion.name} Is Scheduled`,
    };
}

export async function updatePromotion(
    promotionId: string,
    input: PromotionInput,
): Promise<AdminPromotionsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const existing = await db.promotion.findUnique({
        where: { id: promotionId },
        select: { id: true, endsAt: true },
    });
    if (!existing) return GONE;

    const now = new Date();
    if (existing.endsAt <= now) return ENDED;

    const values = await clean(input, now);
    if ("error" in values) return { ok: false, message: values.error };

    const promotion = await db.promotion.update({
        where: { id: existing.id },
        data: {
            name: values.name,
            discountType: values.discountType,
            value: values.value,
            scope: values.scope,
            startsAt: values.startsAt,
            endsAt: values.endsAt,
            forceOnAllCourses: values.forceOnAllCourses,
            categories: { set: values.categoryIds.map((id) => ({ id })) },
        },
        select: { id: true, name: true },
    });

    await log(
        session,
        "Updated platform promotion",
        "promotion",
        promotion.id,
        promotion.name,
    );
    revalidateConsole();
    return { ok: true, message: `${promotion.name} Was Updated` };
}

export async function endPromotion(
    promotionId: string,
): Promise<AdminPromotionsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const promotion = await db.promotion.findUnique({
        where: { id: promotionId },
        select: { id: true, name: true, startsAt: true, endsAt: true },
    });
    if (!promotion) return GONE;

    const now = new Date();
    if (promotion.endsAt <= now) return ENDED;
    const started = promotion.startsAt <= now;

    await db.promotion.update({
        where: { id: promotion.id },
        data: {
            endsAt: now,
            ...(started ? {} : { startsAt: now }),
        },
    });

    await log(
        session,
        started ? "Ended Platform Promotion" : "Cancelled Platform Promotion",
        "promotion",
        promotion.id,
        promotion.name,
    );
    revalidateConsole();
    return {
        ok: true,
        message: started
            ? `${promotion.name} Has Ended`
            : `${promotion.name} Was Cancelled`,
    };
}

export async function setInstructorPromotionOptIn(
    instructorId: string,
    participating: boolean,
): Promise<AdminPromotionsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const instructor = await db.instructor.findUnique({
        where: { id: instructorId },
        select: { id: true, name: true, promotionOptIn: true },
    });
    if (!instructor) {
        return {
            ok: false,
            message: "That Instructor No Longer Exists — Reload The Page.",
        };
    }

    const next = participating === true;
    if (instructor.promotionOptIn === next) {
        return {
            ok: true,
            message: next
                ? `${instructor.name} Is Already Participating`
                : `${instructor.name} Is Already Opted Out`,
        };
    }

    await db.instructor.update({
        where: { id: instructor.id },
        data: { promotionOptIn: next },
    });

    await log(
        session,
        next
            ? "Opted An Instructor Into Promotions"
            : "Opted An Instructor Out Of Promotions",
        "instructor",
        instructor.id,
        instructor.name,
    );
    revalidateConsole();
    return {
        ok: true,
        message: next
            ? `${instructor.name} Now Joins Lumen Promotions`
            : `${instructor.name} Is Opted Out Of Lumen Promotions`,
    };
}
