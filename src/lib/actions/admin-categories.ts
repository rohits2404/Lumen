"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
    categoryAccent,
    CATEGORY_DESCRIPTION_MAX_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
} from "@/lib/config/admin-categories";

export type AdminCategoriesResult = { ok: boolean; message: string };

const DENIED: AdminCategoriesResult = {
    ok: false,
    message: "You Do Not Have Access To Categories.",
};

const NOT_FOUND: AdminCategoriesResult = {
    ok: false,
    message: "That Category Could Not Be Found.",
};

export type CategoryInput = {
    name: string;
    description: string;
    accentColor: string;
    showInNav: boolean;
};

type CleanInput = {
    name: string;
    description: string | null;
    accentColor: string;
    showInNav: boolean;
};

function clean(input: CategoryInput): CleanInput | null {
    const name = (input?.name ?? "").trim().slice(0, CATEGORY_NAME_MAX_LENGTH);
    if (name.length === 0) return null;

    const description = (input?.description ?? "")
        .trim()
        .slice(0, CATEGORY_DESCRIPTION_MAX_LENGTH);

    return {
        name,
        description: description.length > 0 ? description : null,
        accentColor: categoryAccent(input?.accentColor),
        showInNav: input?.showInNav === true,
    };
}

function slugify(name: string): string {
    const slug = name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);

    return slug.length > 0 ? slug : "category";
}

async function uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);

    const taken = new Set(
        (
            await db.category.findMany({
                where: { slug: { startsWith: base } },
                select: { slug: true },
            })
        ).map((row) => row.slug),
    );

    if (!taken.has(base)) return base;
    let suffix = 2;
    while (taken.has(`${base}-${suffix}`)) suffix += 1;
    return `${base}-${suffix}`;
}

export async function createCategory(
    input: CategoryInput,
): Promise<AdminCategoriesResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") return DENIED;

    const values = clean(input);
    if (!values) {
        return { ok: false, message: "Give The Category a Name." };
    }

    const [slug, last] = await Promise.all([
        uniqueSlug(values.name),
        db.category.findFirst({
            orderBy: { order: "desc" },
            select: { order: true },
        }),
    ]);

    const category = await db.category.create({
        data: { ...values, slug, order: (last?.order ?? -1) + 1 },
        select: { id: true, name: true },
    });

    await db.auditLog.create({
        data: {
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role ?? null,
            action: "Created a category",
            targetType: "category",
            targetId: category.id,
            targetLabel: category.name,
            category: "COURSES",
        },
    });

    revalidateCategories();

    return { ok: true, message: `${category.name} Was Created` };
}

export async function updateCategory(
    id: string,
    input: CategoryInput,
): Promise<AdminCategoriesResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") return DENIED;

    if (typeof id !== "string" || id.length === 0) return NOT_FOUND;

    const values = clean(input);
    if (!values) {
        return { ok: false, message: "Give The Category a Name." };
    }

    const existing = await db.category.findUnique({
        where: { id },
        select: { id: true, name: true },
    });
    if (!existing) return NOT_FOUND;

    const category = await db.category.update({
        where: { id },
        data: values,
        select: { id: true, name: true },
    });

    await db.auditLog.create({
        data: {
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role ?? null,
            action: "Updated a category",
            targetType: "category",
            targetId: category.id,
            targetLabel: category.name,
            category: "COURSES",
        },
    });

    revalidateCategories();

    return { ok: true, message: `${category.name} was updated` };
}

export async function deleteCategory(
    id: string,
): Promise<AdminCategoriesResult> {
    const session = await getSession();
    if (session?.user.role !== "admin") return DENIED;

    if (typeof id !== "string" || id.length === 0) return NOT_FOUND;

    const category = await db.category.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            _count: { select: { courses: true, children: true } },
        },
    });
    if (!category) return NOT_FOUND;

    if (category._count.children > 0) {
        return {
            ok: false,
            message: `${category.name} Has Sub-Categories Rolling Up Into It — Move Or Delete Those First.`,
        };
    }

    if (category._count.courses > 0) {
        return {
            ok: false,
            message: `${category.name} Still Has Courses Filed Under It — Move Them First.`,
        };
    }

    await db.$transaction([
        db.category.delete({ where: { id: category.id } }),
        db.auditLog.create({
            data: {
                actorId: session.user.id,
                actorName: session.user.name,
                actorRole: session.user.role ?? null,
                action: "Deleted a Category",
                targetType: "category",
                targetId: category.id,
                targetLabel: category.name,
                category: "COURSES",
            },
        }),
    ]);

    revalidateCategories();

    return { ok: true, message: `${category.name} Was Deleted` };
}

function revalidateCategories() {
    revalidatePath("/dashboard/admin", "layout");
}
