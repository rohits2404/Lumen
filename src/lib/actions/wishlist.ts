"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCatalogCourse } from "@/lib/catalog";

export type WishlistActionResult = {
    ok: boolean;
    message: string;
    wishlisted: boolean;
};

export async function toggleWishlist(
    slug: string,
): Promise<WishlistActionResult> {
    const session = await getSession();
    if (!session) {
        return {
            ok: false,
            message: "Sign In To Save Courses To Your Wishlist.",
            wishlisted: false,
        };
    }

    const course = await getCatalogCourse(slug);
    if (!course) {
        return {
            ok: false,
            message: "That Course Is No Longer Available.",
            wishlisted: false,
        };
    }

    const where = {
        userId_courseSlug: { userId: session.user.id, courseSlug: slug },
    };
    const existing = await db.wishlistItem.findUnique({
        where,
        select: { id: true },
    });

    if (existing) {
        await db.wishlistItem.delete({ where });
    } else {
        await db.wishlistItem.create({
            data: { userId: session.user.id, courseSlug: slug },
        });
    }

    revalidatePath("/dashboard", "layout");
    return {
        ok: true,
        wishlisted: !existing,
        message: existing
            ? `${course.title} Was Removed From Your Wishlist`
            : `${course.title} Was Saved To Your Wishlist`,
    };
}

export async function removeFromWishlist(
    slug: string,
): Promise<WishlistActionResult> {
    const session = await getSession();
    if (!session) {
        return {
            ok: false,
            message: "Sign In To Manage Your Wishlist.",
            wishlisted: false,
        };
    }

    const deleted = await db.wishlistItem.deleteMany({
        where: { userId: session.user.id, courseSlug: slug },
    });
    if (deleted.count === 0) {
        return {
            ok: false,
            message: "That Course Was Not On Your Wishlist.",
            wishlisted: false,
        };
    }

    revalidatePath("/dashboard", "layout");
    const course = await getCatalogCourse(slug);
    return {
        ok: true,
        wishlisted: false,
        message: course
            ? `${course.title} Was Removed From Your Wishlist`
            : "Course Removed From Your Wishlist",
    };
}
