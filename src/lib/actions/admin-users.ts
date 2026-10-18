"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { countryCodes } from "@/lib/config/countries";
import { INVITATION_TTL_DAYS, newUserRoles } from "@/lib/config/admin-users";
import type { UserPlan } from "@/lib/admin/users";
import type { UserStatus } from "@/generated/prisma/client";

export type AdminUsersResult = { ok: boolean; message: string };

const DENIED: AdminUsersResult = {
    ok: false,
    message: "You Do Not Have Access To The User Console.",
};

async function requireAdmin() {
    const session = await getSession();
    if (session?.user.role !== "admin") return null;
    return session;
}

function revalidateConsole() {
    revalidatePath("/dashboard/admin", "layout");
}

export async function setUserStatus(
    userIds: string[],
    status: Extract<UserStatus, "ACTIVE" | "SUSPENDED">,
): Promise<AdminUsersResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const ids = [...new Set(userIds.filter((id) => typeof id === "string"))];
    if (ids.length === 0) {
        return { ok: false, message: "No Accounts Were Selected." };
    }

    if (status === "SUSPENDED" && ids.includes(session.user.id)) {
        return { ok: false, message: "You Cannot Suspend Your Own Account." };
    }

    const targets = await db.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (targets.length === 0) {
        return { ok: false, message: "Those Accounts No Longer Exist." };
    }

    if (status === "SUSPENDED") {
        const admins = targets.filter((target) => target.role === "admin");
        if (admins.length > 0) {
            const remaining = await db.user.count({
                where: {
                    role: "admin",
                    status: { not: "SUSPENDED" },
                    id: { notIn: admins.map((admin) => admin.id) },
                },
            });
            if (remaining === 0) {
                return {
                    ok: false,
                    message:
                        "That Would Leave The Platform With No Active Admin. Promote Someone Else First.",
                };
            }
        }
    }

    const suspending = status === "SUSPENDED";

    await db.$transaction([
        db.user.updateMany({
            where: { id: { in: targets.map((target) => target.id) } },
            data: {
                status,
                banned: suspending,
                banReason: suspending
                    ? "Suspended From The Admin Console"
                    : null,
                banExpires: null,
            },
        }),
        db.auditLog.createMany({
            data: targets.map((target) => ({
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role ?? null,
                action: suspending
                    ? "Suspended An Account"
                    : "Reactivated An Account",
                targetType: "user",
                targetId: target.id,
                targetLabel: target.email,
                category: "SECURITY" as const,
            })),
        }),
    ]);

    revalidateConsole();

    const noun =
        targets.length === 1 ? targets[0]!.name : `${targets.length} Accounts`;
    return {
        ok: true,
        message: suspending ? `${noun} Suspended` : `${noun} Reactivated`,
    };
}

export type NewUserInput = {
    name: string;
    email: string;
    country: string;
    plan: UserPlan;
    role: "user" | "instructor" | "admin";
    sendEmail: boolean;
};

const roleValues = new Set(newUserRoles.map((role) => role.value));

export async function createUser(
    input: NewUserInput,
): Promise<AdminUsersResult> {
    const session = await requireAdmin();
    if (!session) return DENIED;

    const name = input.name?.trim() ?? "";
    const email = input.email?.trim().toLowerCase() ?? "";
    const country = input.country?.trim().toUpperCase() ?? "";

    if (name.length < 2) {
        return { ok: false, message: "Enter The Person's Full Name." };
    }
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
        return { ok: false, message: "Enter a Valid Email Address." };
    }
    if (!countryCodes.includes(country)) {
        return { ok: false, message: "Choose a Country From The List." };
    }
    if (!roleValues.has(input.role)) {
        return { ok: false, message: "Choose a Role." };
    }
    const plan: UserPlan = input.plan === "business" ? "business" : "free";

    const existing = await db.user.findUnique({
        where: { email },
        select: { id: true },
    });
    if (existing) {
        return { ok: false, message: "An Account Already Uses That Address." };
    }

    let created: { id: string };
    try {
        const result = await auth.api.createUser({
            headers: await headers(),
            body: {
                email,
                name,
                role: "user",
                password: randomBytes(32).toString("base64url"),
            },
        });
        created = result.user;
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "That Account Could Not Be Created.",
        };
    }

    await db.user.update({
        where: { id: created.id },
        data: { country, status: "PENDING", role: input.role },
    });

    await db.userInvitation.create({
        data: {
            email,
            name,
            role: input.role,
            country,
            plan: plan === "business" ? "business" : null,
            token: randomBytes(32).toString("base64url"),
            sendEmail: input.sendEmail,
            expiresAt: new Date(
                Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
            ),
            invitedById: session.user.id,
        },
    });

    await db.auditLog.create({
        data: {
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role ?? null,
            action: input.sendEmail
                ? "Invited a New Member"
                : "Created An Account Silently",
            targetType: "user",
            targetId: created.id,
            targetLabel: email,
            category: "MEMBERS",
        },
    });

    if (input.sendEmail) {
        try {
            await auth.api.requestPasswordReset({
                body: { email, redirectTo: "/reset-password" },
            });
        } catch {
            revalidateConsole();
            return {
                ok: true,
                message: `${name} Was Added, But The Invitation Email Could Not Be Sent.`,
            };
        }
    }

    revalidateConsole();
    return {
        ok: true,
        message: input.sendEmail
            ? `${name} Was Invited — They Will Get An Email To Set A Password.`
            : `${name} Was Added Without An Invitation Email.`,
    };
}
