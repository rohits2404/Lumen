"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { languages, timeZoneIds } from "@/lib/config/locale";
import { MIN_AGE_YEARS } from "@/lib/config/settings";

export type AccountFieldErrors = {
    dateOfBirth?: string;
    language?: string;
    timeZone?: string;
};

export type AccountActionResult = {
    ok: boolean;
    message: string;
    errors?: AccountFieldErrors;
};

const languageCodes = new Set(languages.map((language) => language.value));

function parseDateInput(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const [year, month, day] = [
        Number(match[1]),
        Number(match[2]),
        Number(match[3]),
    ];
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }
    return date;
}

function yearsSince(date: Date) {
    const now = new Date();
    const years = now.getUTCFullYear() - date.getUTCFullYear();
    const beforeBirthday =
        now.getUTCMonth() < date.getUTCMonth() ||
        (now.getUTCMonth() === date.getUTCMonth() &&
            now.getUTCDate() < date.getUTCDate());
    return beforeBirthday ? years - 1 : years;
}

export async function updateAccount(
    formData: FormData,
): Promise<AccountActionResult> {
    const session = await getSession();
    if (!session) {
        return { ok: false, message: "Sign In To Update Your Account." };
    }

    const errors: AccountFieldErrors = {};

    const rawDateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
    let dateOfBirth: Date | null = null;
    if (rawDateOfBirth) {
        dateOfBirth = parseDateInput(rawDateOfBirth);
        if (!dateOfBirth) {
            errors.dateOfBirth = "Pick a Valid Date.";
        } else {
            const age = yearsSince(dateOfBirth);
            if (age < 0) {
                errors.dateOfBirth = "That Date Is In The Future.";
            } else if (age < MIN_AGE_YEARS) {
                errors.dateOfBirth = `You Need To Be At Least ${MIN_AGE_YEARS} To Use Lumen.`;
            } else if (age > 120) {
                errors.dateOfBirth = "Check That Year — It Doesn't Look Right.";
            }
        }
    }

    const rawLanguage = String(formData.get("language") ?? "").trim();
    if (rawLanguage && !languageCodes.has(rawLanguage)) {
        errors.language = "Choose a Language From The List.";
    }

    const rawTimeZone = String(formData.get("timeZone") ?? "").trim();
    if (rawTimeZone && !timeZoneIds.has(rawTimeZone)) {
        errors.timeZone = "Choose a Time Zone From The List.";
    }

    if (Object.keys(errors).length > 0) {
        return {
            ok: false,
            message: "Check The Highlighted Fields And Try Again.",
            errors,
        };
    }

    await db.user.update({
        where: { id: session.user.id },
        data: {
            dateOfBirth,
            language: rawLanguage || null,
            timeZone: rawTimeZone || null,
        },
    });

    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Account Updated." };
}
