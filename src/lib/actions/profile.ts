"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    emailChangeMessage,
    requestEmailChange,
    type EmailChangeOutcome,
} from "@/lib/email-change";
import { suggestUsername, usernameUnlocksAt } from "@/lib/profile";
import { deleteAvatar, putAvatar } from "@/lib/storage";
import {
    AVATAR_MAX_BYTES,
    AVATAR_MIME_TYPES,
    MAX_BIO_LENGTH,
    MAX_EMAIL_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PROFILE_URLS,
    USERNAME_CHANGE_DAYS,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
} from "@/lib/config/settings";

export type ProfileFieldErrors = {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    urls?: (string | undefined)[];
};

export type ProfileActionResult = {
    ok: boolean;
    message: string;
    errors?: ProfileFieldErrors;
};

const USERNAME_PATTERN = /^[a-z0-9_-]+$/;

function normalizeUsername(raw: string) {
    return raw.trim().toLowerCase();
}

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

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export async function updateProfile(
    formData: FormData,
): Promise<ProfileActionResult> {
    const session = await getSession();
    if (!session) {
        return { ok: false, message: "Sign In To Update Your Profile." };
    }

    const current = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            username: true,
            usernameChangedAt: true,
        },
    });
    if (!current) {
        return { ok: false, message: "We Couldn't Find Your Account." };
    }

    const errors: ProfileFieldErrors = {};

    const name = String(formData.get("name") ?? "")
        .trim()
        .slice(0, MAX_NAME_LENGTH);
    if (name.length === 0) errors.name = "Enter Your Name.";

    const username = normalizeUsername(String(formData.get("username") ?? ""));
    const effective = current.username ?? suggestUsername(current.name);
    const changed = username !== effective;

    if (username.length < USERNAME_MIN_LENGTH) {
        errors.username = `Use At Least ${USERNAME_MIN_LENGTH} Characters.`;
    } else if (username.length > USERNAME_MAX_LENGTH) {
        errors.username = `Use At Most ${USERNAME_MAX_LENGTH} Characters.`;
    } else if (!USERNAME_PATTERN.test(username)) {
        errors.username =
            "Use Lowercase Letters, Numbers, Hyphens And Underscores Only.";
    } else if (changed) {
        const lockedUntil = usernameUnlocksAt(current.usernameChangedAt);
        if (lockedUntil) {
            errors.username = `You Can Change This Again On ${formatDate(lockedUntil)}.`;
        } else {
            const taken = await db.user.findFirst({
                where: { username, NOT: { id: session.user.id } },
                select: { id: true },
            });
            if (taken) errors.username = "That Username Is Already Taken.";
        }
    }

    const bio = String(formData.get("bio") ?? "").trim();
    if (bio.length > MAX_BIO_LENGTH) {
        errors.bio = `Keep It Under ${MAX_BIO_LENGTH} Characters.`;
    }

    const submitted = formData.getAll("url").map(String);
    const urlErrors: (string | undefined)[] = [];
    const urls: string[] = [];

    submitted.forEach((raw, index) => {
        if (!raw.trim()) return;
        const normalized = normalizeUrl(raw);
        if (!normalized) {
            urlErrors[index] = "Enter a Valid Web Address.";
            return;
        }
        if (urls.includes(normalized)) {
            urlErrors[index] = "You've Already Added That Link.";
            return;
        }
        urls.push(normalized);
    });

    if (urls.length > MAX_PROFILE_URLS) {
        urlErrors[MAX_PROFILE_URLS] = `Up To ${MAX_PROFILE_URLS} Links.`;
    }
    if (urlErrors.some(Boolean)) errors.urls = urlErrors;

    if (Object.keys(errors).length > 0) {
        return {
            ok: false,
            message: "Check The Highlighted Fields And Try Again.",
            errors,
        };
    }

    const emailOutcome: EmailChangeOutcome = await requestEmailChange(
        session.user.id,
        current.email,
        String(formData.get("email") ?? "").slice(0, MAX_EMAIL_LENGTH),
    );
    if (emailOutcome.status === "error") {
        return {
            ok: false,
            message: "Check The Highlighted Fields And Try Again.",
            errors: { email: emailOutcome.message },
        };
    }

    await db.user.update({
        where: { id: session.user.id },
        data: {
            username,
            ...(changed ? { usernameChangedAt: new Date() } : {}),
            bio: bio || null,
            urls: urls.slice(0, MAX_PROFILE_URLS),
        },
    });

    if (name !== current.name) {
        await auth.api.updateUser({ body: { name }, headers: await headers() });
    }

    revalidatePath("/dashboard", "layout");
    return {
        ok: true,
        message: [
            changed
                ? `Profile Updated. Your Username Is Locked For ${USERNAME_CHANGE_DAYS} Days.`
                : "Profile Updated.",
            emailChangeMessage(emailOutcome),
        ]
            .filter(Boolean)
            .join(" "),
    };
}

export async function uploadAvatar(
    formData: FormData,
): Promise<ProfileActionResult> {
    const session = await getSession();
    if (!session) {
        return { ok: false, message: "Sign In To Change Your Picture." };
    }

    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, message: "Choose An Image To Upload." };
    }
    if (!AVATAR_MIME_TYPES.includes(file.type as never)) {
        return { ok: false, message: "Use a JPEG, PNG, WebP Or GIF Image." };
    }
    if (file.size > AVATAR_MAX_BYTES) {
        const mb = Math.round(AVATAR_MAX_BYTES / (1024 * 1024));
        return { ok: false, message: `Images Must Be Under ${mb}MB.` };
    }

    const url = await putAvatar(session.user.id, {
        bytes: new Uint8Array(await file.arrayBuffer()),
        contentType: file.type,
    });
    if (!url) {
        return {
            ok: false,
            message:
                "Image Uploads Aren't Configured For This Environment Yet.",
        };
    }

    const previous = session.user.image ?? null;
    await auth.api.updateUser({
        body: { image: url },
        headers: await headers(),
    });
    await deleteAvatar(session.user.id, previous);

    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Profile Picture Updated." };
}
