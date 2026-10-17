"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    MAX_PAYOUT_METHODS,
    PAYOUT_LABEL_MAX_LENGTH,
    PAYOUT_LAST4_LENGTH,
    payoutMethodTypeValues,
    type PayoutMethodTypeValue,
} from "@/lib/config/instructor-payouts";
import { platformCurrencyValues } from "@/lib/config/admin-settings";

export type PayoutMethodFieldErrors = {
    label?: string;
    last4?: string;
    currency?: string;
};

export type PayoutActionResult = {
    ok: boolean;
    message: string;
    errors?: PayoutMethodFieldErrors;
};

export type PayoutMethodInput = {
    type: PayoutMethodTypeValue;
    label: string;
    last4: string;
    currency: string;
    primary: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DIGITS_ONLY = /^\d+$/;

async function currentInstructor() {
    const session = await getSession();
    if (!session) return null;

    return db.instructor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
    });
}

function validate(input: PayoutMethodInput): PayoutMethodFieldErrors {
    const errors: PayoutMethodFieldErrors = {};
    const label = input.label.trim();

    if (label.length === 0) {
        errors.label =
            input.type === "PAYPAL"
                ? "Enter your PayPal email."
                : "Enter your bank's name.";
    } else if (label.length > PAYOUT_LABEL_MAX_LENGTH) {
        errors.label = `Keep it under ${PAYOUT_LABEL_MAX_LENGTH} characters.`;
    } else if (input.type === "PAYPAL" && !EMAIL_PATTERN.test(label)) {
        errors.label = "Enter a valid email address.";
    }

    if (input.type === "BANK_TRANSFER") {
        const last4 = input.last4.trim();
        if (last4.length !== PAYOUT_LAST4_LENGTH || !DIGITS_ONLY.test(last4)) {
            errors.last4 = `Enter the last ${PAYOUT_LAST4_LENGTH} digits of the account.`;
        }
        if (!platformCurrencyValues.has(input.currency)) {
            errors.currency = "Choose a currency.";
        }
    }

    return errors;
}

async function makePrimary(instructorId: string, methodId: string) {
    await db.$transaction([
        db.payoutMethod.updateMany({
            where: { instructorId, NOT: { id: methodId } },
            data: { role: "BACKUP" },
        }),
        db.payoutMethod.updateMany({
            where: { id: methodId, instructorId },
            data: { role: "PRIMARY" },
        }),
    ]);
}

export async function savePayoutMethod(
    input: PayoutMethodInput,
    methodId?: string,
): Promise<PayoutActionResult> {
    const instructor = await currentInstructor();
    if (!instructor) {
        return { ok: false, message: "Only instructors can set up payouts." };
    }

    if (!payoutMethodTypeValues.has(input.type)) {
        return { ok: false, message: "Choose a payout method type." };
    }

    const errors = validate(input);
    if (Object.keys(errors).length > 0) {
        return {
            ok: false,
            message: "Check the highlighted fields and try again.",
            errors,
        };
    }

    const label = input.label.trim();
    const isBank = input.type === "BANK_TRANSFER";
    const data = {
        type: input.type,
        label,
        last4: isBank ? input.last4.trim() : null,
        currency: isBank ? input.currency : "usd",
    };

    const existing = await db.payoutMethod.count({
        where: { instructorId: instructor.id },
    });

    let savedId: string;

    if (methodId) {
        const updated = await db.payoutMethod.updateMany({
            where: { id: methodId, instructorId: instructor.id },
            data,
        });
        if (updated.count === 0) {
            return {
                ok: false,
                message: "We couldn't find that payout method.",
            };
        }
        savedId = methodId;
    } else {
        if (existing >= MAX_PAYOUT_METHODS) {
            return {
                ok: false,
                message: `You can keep up to ${MAX_PAYOUT_METHODS} payout methods.`,
            };
        }
        const created = await db.payoutMethod.create({
            data: {
                ...data,
                instructorId: instructor.id,
                role: existing === 0 || input.primary ? "PRIMARY" : "BACKUP",
            },
            select: { id: true },
        });
        savedId = created.id;
    }

    if (input.primary || existing === 0) {
        await makePrimary(instructor.id, savedId);
    }

    revalidatePath("/dashboard/instructor/settings/payouts");
    return {
        ok: true,
        message: methodId ? "Payout method updated." : "Payout method added.",
    };
}

export async function removePayoutMethod(
    methodId: string,
): Promise<PayoutActionResult> {
    const instructor = await currentInstructor();
    if (!instructor) {
        return { ok: false, message: "Only instructors can set up payouts." };
    }

    const deleted = await db.payoutMethod.deleteMany({
        where: { id: methodId, instructorId: instructor.id },
    });
    if (deleted.count === 0) {
        return { ok: false, message: "We couldn't find that payout method." };
    }

    const survivors = await db.payoutMethod.findMany({
        where: { instructorId: instructor.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true },
    });
    if (survivors.length > 0 && !survivors.some((m) => m.role === "PRIMARY")) {
        await makePrimary(instructor.id, survivors[0]!.id);
    }

    revalidatePath("/dashboard/instructor/settings/payouts");
    return { ok: true, message: "Payout method removed." };
}

export async function updatePayoutPreferences(
    emailPayoutReceipt: boolean,
): Promise<PayoutActionResult> {
    const instructor = await currentInstructor();
    if (!instructor) {
        return { ok: false, message: "Only instructors can set up payouts." };
    }

    await db.instructor.update({
        where: { id: instructor.id },
        data: { emailPayoutReceipt: Boolean(emailPayoutReceipt) },
    });

    revalidatePath("/dashboard/instructor/settings/payouts");
    return { ok: true, message: "Payout settings saved." };
}
