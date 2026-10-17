"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canTeach, getInstructorProfile } from "@/lib/instructor";
import {
    ACTIVE_COUPONS_PER_COURSE,
    COUPON_CODE_MAX,
    COUPON_CODE_MIN,
} from "@/lib/config/instructor-coupons";
import type { PromotionDiscountType } from "@/generated/prisma/client";

function revalidateCoupons() {
    revalidatePath("/dashboard/instructor/coupons");
    revalidatePath("/dashboard/instructor/courses/[slug]/edit/[step]", "page");
}

export type CouponActionResult = {
    ok: boolean;
    message: string;
    couponId?: string;
};

export type CouponInput = {
    code: string;
    courseId: string;
    discountType: PromotionDiscountType;
    percentOff: number;
    priceCents: number;
    redemptionLimit: number | null;
    startsAt: string | null;
    endsAt: string | null;
};

function resolveDiscount(
    input: CouponInput,
    listPriceCents: number,
): { percentOff: number; resultingPriceCents: number } | null {
    if (input.discountType === "FIXED_PRICE") {
        const price = Math.round(input.priceCents);
        if (!Number.isFinite(price) || price < 0 || price >= listPriceCents) {
            return null;
        }
        return {
            percentOff: Math.round(
                ((listPriceCents - price) / listPriceCents) * 100,
            ),
            resultingPriceCents: price,
        };
    }

    const percent = Math.round(input.percentOff);
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) return null;
    return {
        percentOff: percent,
        resultingPriceCents: Math.round(
            (listPriceCents * (100 - percent)) / 100,
        ),
    };
}

function normaliseCode(code: string) {
    return code.trim().toUpperCase().replace(/\s+/g, "");
}

function parseDate(value: string | null): Date | null | undefined {
    if (value === null || value.trim() === "") return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

type Validated = {
    profileId: string;
    courseId: string;
    code: string;
    limit: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
    percentOff: number;
    resultingPriceCents: number;
};

type ValidationResult =
    { ok: false; message: string } | { ok: true; value: Validated };

const invalid = (message: string): ValidationResult => ({ ok: false, message });

async function validate(
    input: CouponInput,
    couponId: string | null,
): Promise<ValidationResult> {
    const session = await getSession();
    if (!session) return invalid("Sign In To Manage Coupons.");
    if (!(await canTeach(session.user))) {
        return invalid("Only Instructors Can Manage Coupons.");
    }

    const profile = await getInstructorProfile(session.user.id);
    if (!profile) return invalid("Only Instructors Can Manage Coupons.");

    const code = normaliseCode(input.code);
    if (code.length < COUPON_CODE_MIN || code.length > COUPON_CODE_MAX) {
        return invalid(
            `Use A Code Between ${COUPON_CODE_MIN} And ${COUPON_CODE_MAX} Characters.`,
        );
    }
    if (!/^[A-Z0-9_-]+$/.test(code)) {
        return invalid(
            "Codes Can Use Letters, Numbers, Hyphens And Underscores.",
        );
    }

    const course = await db.course.findFirst({
        where: { id: input.courseId, instructorId: profile.id },
        select: { id: true, listPriceCents: true },
    });
    if (!course) return invalid("Choose One Of Your Own Courses.");

    const discount = resolveDiscount(input, course.listPriceCents);
    if (!discount) {
        return invalid(
            input.discountType === "FIXED_PRICE"
                ? "Enter A Price Below The Course's List Price."
                : "Enter A Percentage Between 1 And 100.",
        );
    }

    const startsAt = parseDate(input.startsAt);
    const endsAt = parseDate(input.endsAt);
    if (startsAt === undefined || endsAt === undefined) {
        return invalid("That Date Isn't Valid.");
    }
    if (startsAt && endsAt && endsAt <= startsAt) {
        return invalid("The End Date Has To Come After The Start Date.");
    }

    const limit =
        input.redemptionLimit === null
            ? null
            : Math.round(input.redemptionLimit);
    if (limit !== null && (!Number.isFinite(limit) || limit < 1)) {
        return invalid("A Redemption Limit Has To Be At Least 1.");
    }

    const taken = await db.coupon.findFirst({
        where: { code, ...(couponId ? { NOT: { id: couponId } } : {}) },
        select: { id: true },
    });
    if (taken) return invalid(`${code} Is Already Taken.`);

    return {
        ok: true,
        value: {
            profileId: profile.id,
            courseId: course.id,
            code,
            limit,
            startsAt,
            endsAt,
            ...discount,
        },
    };
}

async function activeCountFor(
    courseId: string,
    now: Date,
    excludeId: string | null,
) {
    return db.coupon.count({
        where: {
            courseId,
            startsAt: { lte: now },
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
            ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
    });
}

function wouldBeActive(startsAt: Date | null, endsAt: Date | null, now: Date) {
    if (startsAt && startsAt > now) return false;
    if (endsAt && endsAt < now) return false;
    return true;
}

export async function createCoupon(
    input: CouponInput,
): Promise<CouponActionResult> {
    const result = await validate(input, null);
    if (!result.ok) return { ok: false, message: result.message };
    const checked = result.value;

    const now = new Date();
    if (wouldBeActive(checked.startsAt, checked.endsAt, now)) {
        const running = await activeCountFor(checked.courseId, now, null);
        if (running >= ACTIVE_COUPONS_PER_COURSE) {
            return {
                ok: false,
                message: `That Course Already Has ${ACTIVE_COUPONS_PER_COURSE} Active Coupons. End One First, Or Schedule This To Start Later.`,
            };
        }
    }

    const coupon = await db.coupon.create({
        data: {
            code: checked.code,
            courseId: checked.courseId,
            instructorId: checked.profileId,
            discountType: input.discountType,
            percentOff: checked.percentOff,
            resultingPriceCents: checked.resultingPriceCents,
            redemptionLimit: checked.limit,
            ...(checked.startsAt ? { startsAt: checked.startsAt } : {}),
            endsAt: checked.endsAt,
        },
        select: { id: true },
    });

    revalidateCoupons();
    return {
        ok: true,
        message: `${checked.code} Created.`,
        couponId: coupon.id,
    };
}

export async function updateCoupon(
    couponId: string,
    input: CouponInput,
): Promise<CouponActionResult> {
    const result = await validate(input, couponId);
    if (!result.ok) return { ok: false, message: result.message };
    const checked = result.value;

    const existing = await db.coupon.findFirst({
        where: { id: couponId, instructorId: checked.profileId },
        select: { id: true },
    });
    if (!existing)
        return { ok: false, message: "That Coupon Isn't Available." };

    const now = new Date();
    if (wouldBeActive(checked.startsAt, checked.endsAt, now)) {
        const running = await activeCountFor(checked.courseId, now, couponId);
        if (running >= ACTIVE_COUPONS_PER_COURSE) {
            return {
                ok: false,
                message: `That Course Already Has ${ACTIVE_COUPONS_PER_COURSE} Active Coupons. End One First, Or Schedule This To Start Later.`,
            };
        }
    }

    await db.coupon.update({
        where: { id: couponId },
        data: {
            code: checked.code,
            courseId: checked.courseId,
            discountType: input.discountType,
            percentOff: checked.percentOff,
            resultingPriceCents: checked.resultingPriceCents,
            redemptionLimit: checked.limit,
            ...(checked.startsAt ? { startsAt: checked.startsAt } : {}),
            endsAt: checked.endsAt,
        },
    });

    revalidateCoupons();
    return { ok: true, message: `${checked.code} Saved.`, couponId };
}

export async function endCoupon(couponId: string): Promise<CouponActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "SIgn In To Manage Coupons." };
    if (!(await canTeach(session.user))) {
        return { ok: false, message: "Only Instructors Can Manage Coupons." };
    }
    const profile = await getInstructorProfile(session.user.id);
    if (!profile) {
        return { ok: false, message: "Only Instructors Can Manage Coupons." };
    }

    const coupon = await db.coupon.findFirst({
        where: { id: couponId, instructorId: profile.id },
        select: { id: true, code: true, startsAt: true, endsAt: true },
    });
    if (!coupon) return { ok: false, message: "That Coupon Isn't Available." };

    const now = new Date();
    if (coupon.endsAt && coupon.endsAt < now) {
        return { ok: false, message: "This Coupon Has Already Ended." };
    }

    await db.coupon.update({
        where: { id: coupon.id },
        data: {
            endsAt: now,
            ...(coupon.startsAt > now ? { startsAt: now } : {}),
        },
    });

    revalidateCoupons();
    return { ok: true, message: `${coupon.code} ended.`, couponId: coupon.id };
}
