"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCatalogCourse } from "@/lib/catalog";
import { getWishlist } from "@/lib/cart";

export type CartActionResult = {
    ok: boolean;
    message: string;
};

async function findCourse(slug: string) {
    return getCatalogCourse(slug);
}

export async function addToCart(slug: string): Promise<CartActionResult> {
    const session = await getSession();
    if (!session)
        return { ok: false, message: "Sign In To Add Courses To Your Cart." };

    const course = await findCourse(slug);
    if (!course)
        return { ok: false, message: "That Course Is No Longer Available." };

    const existing = await db.cartItem.findUnique({
        where: {
            userId_courseSlug: { userId: session.user.id, courseSlug: slug },
        },
        select: { id: true },
    });
    if (existing) {
        return { ok: true, message: `${course.title} Is Already In Your Cart` };
    }

    await db.cartItem.create({
        data: { userId: session.user.id, courseSlug: slug },
    });

    revalidatePath("/dashboard", "layout");
    return { ok: true, message: `${course.title} Was Added To Your Cart` };
}

export async function removeFromCart(slug: string): Promise<CartActionResult> {
    const session = await getSession();
    if (!session) return { ok: false, message: "Sign In To Manage Your Cart." };

    const deleted = await db.cartItem.deleteMany({
        where: { userId: session.user.id, courseSlug: slug },
    });
    if (deleted.count === 0) {
        return { ok: false, message: "That Course Was Not In Your Cart." };
    }

    revalidatePath("/dashboard", "layout");
    const course = await findCourse(slug);
    return {
        ok: true,
        message: course ? `${course.title} Was Removed` : "Course Removed",
    };
}

export async function addWishlistToCart(): Promise<CartActionResult> {
    const session = await getSession();
    if (!session)
        return { ok: false, message: "Sign In To Add Courses To Your Cart." };

    const { lines } = await getWishlist();
    if (lines.length === 0) {
        return { ok: false, message: "Your Wishlist Is Empty." };
    }

    const { count } = await db.cartItem.createMany({
        data: lines.map((line) => ({
            userId: session.user.id,
            courseSlug: line.course.slug,
        })),
        skipDuplicates: true,
    });

    if (count === 0) {
        return {
            ok: true,
            message: "Every Saved Course Is Already In Your Cart",
        };
    }

    revalidatePath("/dashboard", "layout");
    return {
        ok: true,
        message: `${count} course${count === 1 ? "" : "s"} Added To Your Cart`,
    };
}
