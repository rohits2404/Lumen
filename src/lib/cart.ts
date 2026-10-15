import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCatalogCoursesBySlug } from "@/lib/catalog";
import type { CatalogCourse } from "@/lib/config/catalog-shape";

export type CartLine = {
    id: string;
    course: CatalogCourse;
};

export type CartSummary = {
    lines: CartLine[];
    subtotal: number;
    discount: number;
    total: number;
};

async function coursesBySlug(slugs: string[]) {
    return getCatalogCoursesBySlug(slugs);
}

export async function getCart(): Promise<CartSummary> {
    const session = await getSession();
    if (!session) return { lines: [], subtotal: 0, discount: 0, total: 0 };

    const rows = await db.cartItem.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    const catalog = await coursesBySlug(rows.map((row) => row.courseSlug));
    const lines = rows.flatMap((row) => {
        const course = catalog.get(row.courseSlug);
        return course ? [{ id: row.id, course }] : [];
    });

    const subtotal = lines.reduce((sum, line) => sum + line.course.price, 0);
    const discount = 0;

    return { lines, subtotal, discount, total: subtotal - discount };
}

export async function getCartCount() {
    const session = await getSession();
    if (!session) return 0;

    const rows = await db.cartItem.findMany({
        where: { userId: session.user.id },
        select: { courseSlug: true },
    });

    const catalog = await coursesBySlug(rows.map((row) => row.courseSlug));
    return rows.filter((row) => catalog.has(row.courseSlug)).length;
}

export async function isWishlisted(slug: string) {
    const session = await getSession();
    if (!session) return false;
    const row = await db.wishlistItem.findUnique({
        where: {
            userId_courseSlug: { userId: session.user.id, courseSlug: slug },
        },
        select: { id: true },
    });
    return row !== null;
}

export type WishlistLine = {
    id: string;
    course: CatalogCourse;
};

export type WishlistSummary = {
    lines: WishlistLine[];
    total: number;
};

export async function getWishlist(): Promise<WishlistSummary> {
    const session = await getSession();
    if (!session) return { lines: [], total: 0 };

    const rows = await db.wishlistItem.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    const catalog = await coursesBySlug(rows.map((row) => row.courseSlug));
    const lines = rows.flatMap((row) => {
        const course = catalog.get(row.courseSlug);
        return course ? [{ id: row.id, course }] : [];
    });

    return {
        lines,
        total: lines.reduce((sum, line) => sum + line.course.price, 0),
    };
}

export async function getWishlistCount() {
    const session = await getSession();
    if (!session) return 0;

    const rows = await db.wishlistItem.findMany({
        where: { userId: session.user.id },
        select: { courseSlug: true },
    });

    const catalog = await coursesBySlug(rows.map((row) => row.courseSlug));
    return rows.filter((row) => catalog.has(row.courseSlug)).length;
}
