import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_EMAIL_LENGTH } from "@/lib/config/settings";

export type EmailChangeOutcome =
    | { status: "unchanged" }
    | { status: "applied"; email: string }
    | { status: "pending"; sentTo: string }
    | { status: "error"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestEmailChange(
    userId: string,
    currentEmail: string,
    raw: string,
): Promise<EmailChangeOutcome> {
    const next = String(raw ?? "")
        .trim()
        .toLowerCase()
        .slice(0, MAX_EMAIL_LENGTH);

    if (next.length === 0)
        return { status: "error", message: "Enter An Email Address." };
    if (next === currentEmail.trim().toLowerCase())
        return { status: "unchanged" };
    if (!EMAIL_PATTERN.test(next)) {
        return { status: "error", message: "Enter a Valid Email Address." };
    }

    const taken = await db.user.findFirst({
        where: { email: next, NOT: { id: userId } },
        select: { id: true },
    });
    if (taken) {
        return { status: "error", message: "That Email Is Already In Use." };
    }

    try {
        await auth.api.changeEmail({
            body: { newEmail: next },
            headers: await headers(),
        });
    } catch {
        return {
            status: "error",
            message: "That Email Couldn't Be Changed. Try Again.",
        };
    }

    const after = await db.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });

    return after?.email.toLowerCase() === next
        ? { status: "applied", email: next }
        : { status: "pending", sentTo: currentEmail };
}

export function emailChangeMessage(outcome: EmailChangeOutcome): string | null {
    switch (outcome.status) {
        case "applied":
            return "Your Email Address Was Updated.";
        case "pending":
            return `Confirm The Change From The Link We Sent To ${outcome.sentTo}.`;
        default:
            return null;
    }
}
