"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLATFORM_SETTING_ID } from "@/lib/admin/settings";
import {
    BRANDING_MAX_BYTES,
    BRANDING_MIME_TYPES,
    META_DESCRIPTION_MAX,
    platformCurrencyValues,
    platformToggleNames,
    PLATFORM_ACCENTS,
    revenueShareValues,
    SUPPORT_EMAIL_MAX,
    WEBSITE_TITLE_MAX,
    type BrandingAssetKind,
} from "@/lib/config/admin-settings";
import { emailChangeMessage, requestEmailChange } from "@/lib/email-change";
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from "@/lib/config/settings";
import { deleteBrandingAsset, putBrandingAsset } from "@/lib/storage";
import type { PlatformSetting } from "@/generated/prisma/client";

export type AdminSettingsResult = {
    ok: boolean;
    message: string;
    emailError?: string;
};

const DENIED: AdminSettingsResult = {
    ok: false,
    message: "You Do Not Have Access To Platform Settings.",
};

async function requireAdmin() {
    const session = await getSession();
    if (session?.user.role !== "admin") return null;
    return session;
}

async function log(
    session: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>,
    action: string,
    targetLabel: string,
) {
    await db.auditLog.create({
        data: {
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role ?? null,
            action,
            targetType: "platform_setting",
            targetId: PLATFORM_SETTING_ID,
            targetLabel,
            category: "SECURITY",
        },
    });
}

export async function updateAdminProfile(
    formData: FormData,
): Promise<AdminSettingsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const name = String(formData.get("name") ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, MAX_NAME_LENGTH);
    if (name.length === 0) {
        return { ok: false, message: "Enter Your Full Name." };
    }

    const emailOutcome = await requestEmailChange(
        session.user.id,
        session.user.email,
        String(formData.get("email") ?? "").slice(0, MAX_EMAIL_LENGTH),
    );
    if (emailOutcome.status === "error") {
        return {
            ok: false,
            message: "Check The Highlighted Field And Try Again.",
            emailError: emailOutcome.message,
        };
    }

    if (name !== session.user.name) {
        await auth.api.updateUser({ body: { name }, headers: await headers() });
    }

    revalidatePath("/dashboard", "layout");
    return {
        ok: true,
        message: ["Profile Updated.", emailChangeMessage(emailOutcome)]
            .filter(Boolean)
            .join(" "),
    };
}

export type PlatformSettingsPatch = {
    accentColor?: string;
    websiteTitle?: string;
    metaDescription?: string;
    supportEmail?: string;
    currency?: string;
    defaultRevenueShareBps?: number;
    toggle?: { name: string; value: boolean };
};

const FIELD_LABELS: Record<string, string> = {
    accentColor: "Accent Colour",
    websiteTitle: "Website Title",
    metaDescription: "Meta Description",
    supportEmail: "Support Email",
    currency: "Platform Currency",
    defaultRevenueShareBps: "Default Instructor Revenue Share",
};

export async function updatePlatformSettings(
    patch: PlatformSettingsPatch,
): Promise<AdminSettingsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const data: Partial<Omit<PlatformSetting, "id" | "updatedAt">> = {};
    const changed: string[] = [];

    if (patch?.accentColor !== undefined) {
        if (
            !(PLATFORM_ACCENTS as readonly string[]).includes(patch.accentColor)
        ) {
            return {
                ok: false,
                message: "That Isn't One Of The Accent Colours.",
            };
        }
        data.accentColor = patch.accentColor;
        changed.push(FIELD_LABELS.accentColor);
    }

    if (patch?.websiteTitle !== undefined) {
        const title = String(patch.websiteTitle)
            .trim()
            .slice(0, WEBSITE_TITLE_MAX);
        if (title.length === 0) {
            return { ok: false, message: "The Website Title Can't Be Empty." };
        }
        data.websiteTitle = title;
        changed.push(FIELD_LABELS.websiteTitle);
    }

    if (patch?.metaDescription !== undefined) {
        const meta = String(patch.metaDescription)
            .trim()
            .slice(0, META_DESCRIPTION_MAX);
        if (meta.length === 0) {
            return {
                ok: false,
                message: "The Meta Description Can't Be Empty.",
            };
        }
        data.metaDescription = meta;
        changed.push(FIELD_LABELS.metaDescription);
    }

    if (patch?.supportEmail !== undefined) {
        const email = String(patch.supportEmail)
            .trim()
            .slice(0, SUPPORT_EMAIL_MAX);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
                ok: false,
                message: "Enter a Valid Support Email Address.",
            };
        }
        data.supportEmail = email;
        changed.push(FIELD_LABELS.supportEmail);
    }

    if (patch?.currency !== undefined) {
        if (!platformCurrencyValues.has(patch.currency)) {
            return { ok: false, message: "That Isn't a Supported Currency." };
        }
        data.currency = patch.currency;
        changed.push(FIELD_LABELS.currency);
    }

    if (patch?.defaultRevenueShareBps !== undefined) {
        const bps = Number(patch.defaultRevenueShareBps);
        if (!revenueShareValues.has(bps)) {
            return {
                ok: false,
                message: "That Isn't a Supported Revenue Share.",
            };
        }
        data.defaultRevenueShareBps = bps;
        changed.push(FIELD_LABELS.defaultRevenueShareBps);
    }

    if (patch?.toggle !== undefined) {
        const { name, value } = patch.toggle;
        if (!platformToggleNames.has(name) && name !== "maintenanceMode") {
            return { ok: false, message: "That Isn't a Platform Setting." };
        }
        (data as Record<string, unknown>)[name] = value === true;
        changed.push(name === "maintenanceMode" ? "maintenance mode" : name);
    }

    if (changed.length === 0) {
        return { ok: false, message: "Nothing To Save." };
    }

    await db.platformSetting.upsert({
        where: { id: PLATFORM_SETTING_ID },
        update: data,
        create: { id: PLATFORM_SETTING_ID, ...data },
    });

    await log(
        session,
        patch.toggle?.name === "maintenanceMode"
            ? patch.toggle.value
                ? "Turned On Maintenance Mode"
                : "Turned Off Maintenance Mode"
            : "Changed Platform Settings",
        changed.join(", "),
    );

    revalidatePath("/", "layout");
    return { ok: true, message: "Changes Saved." };
}

export async function uploadBrandingAsset(
    formData: FormData,
): Promise<AdminSettingsResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const kind = String(formData.get("kind") ?? "");
    if (kind !== "logo" && kind !== "favicon") {
        return { ok: false, message: "Pick a Logo Or a Favicon To Upload." };
    }
    const assetKind: BrandingAssetKind = kind;

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, message: "Choose An Image To Upload." };
    }
    if (!BRANDING_MIME_TYPES.includes(file.type as never)) {
        return { ok: false, message: "Use a PNG, WebP, JPEG Or ICO Image." };
    }
    if (file.size > BRANDING_MAX_BYTES) {
        const mb = Math.round(BRANDING_MAX_BYTES / (1024 * 1024));
        return { ok: false, message: `Images Must Be Under ${mb}MB.` };
    }

    const url = await putBrandingAsset(assetKind, {
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

    const current = await db.platformSetting.findUnique({
        where: { id: PLATFORM_SETTING_ID },
        select: { logoUrl: true, faviconUrl: true },
    });
    const previous =
        assetKind === "logo"
            ? (current?.logoUrl ?? null)
            : (current?.faviconUrl ?? null);

    await db.platformSetting.upsert({
        where: { id: PLATFORM_SETTING_ID },
        update: assetKind === "logo" ? { logoUrl: url } : { faviconUrl: url },
        create:
            assetKind === "logo"
                ? { id: PLATFORM_SETTING_ID, logoUrl: url }
                : { id: PLATFORM_SETTING_ID, faviconUrl: url },
    });

    await deleteBrandingAsset(assetKind, previous);

    await log(
        session,
        assetKind === "logo"
            ? "Changed The Platform Logo"
            : "Changed The Favicon",
        assetKind,
    );
    revalidatePath("/", "layout");
    return {
        ok: true,
        message: assetKind === "logo" ? "Logo Updated." : "Favicon Updated.",
    };
}
