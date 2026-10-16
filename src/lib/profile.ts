import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    USERNAME_CHANGE_DAYS,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
} from "@/lib/config/settings";

export type Profile = {
    name: string;
    email: string;
    image: string | null;
    username: string;
    bio: string;
    urls: string[];
    usernameLockedUntil: Date | null;
};

export function suggestUsername(name: string) {
    const slug = name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
    return slug.slice(0, USERNAME_MAX_LENGTH).padEnd(USERNAME_MIN_LENGTH, "0");
}

export function usernameUnlocksAt(changedAt: Date | null) {
    if (!changedAt) return null;
    const unlocks = new Date(
        changedAt.getTime() + USERNAME_CHANGE_DAYS * 24 * 60 * 60 * 1000,
    );
    return unlocks > new Date() ? unlocks : null;
}

export async function getProfile(): Promise<Profile | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            image: true,
            username: true,
            usernameChangedAt: true,
            bio: true,
            urls: true,
        },
    });
    if (!user) return null;

    return {
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username ?? suggestUsername(user.name),
        bio: user.bio ?? "",
        urls: user.urls,
        usernameLockedUntil: usernameUnlocksAt(user.usernameChangedAt),
    };
}
