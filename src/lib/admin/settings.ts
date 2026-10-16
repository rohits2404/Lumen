import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PlatformSetting } from "@/generated/prisma/client";

export const PLATFORM_SETTING_ID = "singleton";

export type AdminProfile = {
    name: string;
    email: string;
    image: string | null;
};

export async function getAdminProfile(): Promise<AdminProfile | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true },
    });
    if (!user) return null;

    return user;
}

export async function getPlatformSettings(): Promise<PlatformSetting> {
    const existing = await db.platformSetting.findUnique({
        where: { id: PLATFORM_SETTING_ID },
    });
    if (existing) return existing;

    try {
        return await db.platformSetting.create({
            data: { id: PLATFORM_SETTING_ID },
        });
    } catch {
        const row = await db.platformSetting.findUnique({
            where: { id: PLATFORM_SETTING_ID },
        });
        if (!row) throw new Error("Platform Settings Row Could Not Be Created");
        return row;
    }
}
