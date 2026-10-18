"use server";

import { revalidatePath } from "next/cache";

import { getPlatformSettings } from "@/lib/admin/settings";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_PROFILE_URLS } from "@/lib/config/settings";
import { canTeach } from "@/lib/instructor";

export type InstructorApplicationFormErrors = {
    pitch?: string;
    portfolioUrls?: string;
};

export type InstructorApplicationActionResult = {
    ok: boolean;
    message: string;
    errors?: InstructorApplicationFormErrors;
};

export type InstructorApplicationStatus =
    "none" | "pending" | "rejected" | "approved";

export type InstructorApplicationSummary = {
    id: string;
    status: InstructorApplicationStatus;
    createdAt: Date;
};

const MAX_PITCH_LENGTH = 2000;

function normalizeUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    try {
        const url = new URL(candidate);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        if (!url.hostname.includes(".")) return null;
        return url.toString().replace(/\/$/, "");
    } catch {
        return null;
    }
}

export async function getInstructorApplicationForUser(
    userId: string,
): Promise<InstructorApplicationSummary | null> {
    const application = await db.instructorApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            status: true,
            createdAt: true,
        },
    });

    if (!application) return null;

    return {
        id: application.id,
        status:
            application.status === "PENDING"
                ? "pending"
                : application.status === "REJECTED"
                  ? "rejected"
                  : application.status === "APPROVED"
                    ? "approved"
                    : "none",
        createdAt: application.createdAt,
    };
}

export async function submitInstructorApplication(
    formData: FormData,
): Promise<InstructorApplicationActionResult> {
    const session = await getSession();
    if (!session) {
        return {
            ok: false,
            message: "Please Sign In To Continue.",
        };
    }

    const settings = await getPlatformSettings();
    if (!settings.instructorApplicationsOpen) {
        return {
            ok: false,
            message: "Instructor Applications Are Currently Closed.",
        };
    }

    if (await canTeach(session.user)) {
        return {
            ok: false,
            message:
                "You Are Already Eligible To Teach. Visit Your Instructor Dashboard.",
        };
    }

    const openApplication = await db.instructorApplication.findFirst({
        where: {
            userId: session.user.id,
            status: "PENDING",
        },
        select: { id: true },
    });

    if (openApplication) {
        return {
            ok: false,
            message: "Your Instructor Application Is Already Under Review.",
        };
    }

    const errors: InstructorApplicationFormErrors = {};
    const pitch = String(formData.get("pitch") ?? "").trim();
    if (!pitch) {
        errors.pitch = "Tell Us What You Want To Teach.";
    } else if (pitch.length > MAX_PITCH_LENGTH) {
        errors.pitch = `Keep Your Pitch Under ${MAX_PITCH_LENGTH} Characters.`;
    }

    const rawPortfolio = String(formData.get("portfolioUrls") ?? "");
    const portfolioEntries = Array.from(
        new Set(
            rawPortfolio
                .split(/[\n\r,]+/)
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    );

    const portfolioUrls: string[] = [];
    for (const entry of portfolioEntries) {
        const normalized = normalizeUrl(entry);
        if (!normalized) {
            errors.portfolioUrls =
                errors.portfolioUrls ?? "Use Valid Website URLs, One Per Line.";
            continue;
        }
        if (!portfolioUrls.includes(normalized)) {
            portfolioUrls.push(normalized);
        }
    }

    if (portfolioUrls.length > MAX_PROFILE_URLS) {
        errors.portfolioUrls = `Add Up To ${MAX_PROFILE_URLS} Links.`;
    }

    if (Object.keys(errors).length > 0) {
        return {
            ok: false,
            message: "Check The Highlighted Fields And Try Again.",
            errors,
        };
    }

    try {
        await db.$transaction(async (tx) => {
            const duplicate = await tx.instructorApplication.findFirst({
                where: {
                    userId: session.user.id,
                    status: "PENDING",
                },
                select: { id: true },
            });

            if (duplicate) {
                throw new Error("duplicate-pending-application");
            }

            await tx.instructorApplication.create({
                data: {
                    userId: session.user.id,
                    pitch,
                    portfolioUrls: portfolioUrls.slice(0, MAX_PROFILE_URLS),
                    status: "PENDING",
                },
            });
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "duplicate-pending-application"
        ) {
            return {
                ok: false,
                message: "Your Instructor Application Is Already Under Review.",
            };
        }

        return {
            ok: false,
            message: "We Couldn't Submit Your Application. Please Try Again.",
        };
    }

    revalidatePath("/teach");
    return {
        ok: true,
        message: "Your Instructor Application Has Been Submitted For Review.",
    };
}
