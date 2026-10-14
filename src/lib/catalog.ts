import "server-only";

import { cache } from "react";
import {
    categoryGradients,
    FALLBACK_CATEGORY_GRADIENT,
} from "@/lib/config/admin-overview";
import type { CatalogCourse } from "@/lib/config/catalog-shape";
import { db } from "@/lib/db";

export type { CatalogCourse };

const catalogSelect = {
    id: true,
    slug: true,
    title: true,
    level: true,
    durationHours: true,
    rating: true,
    reviewsCount: true,
    priceCents: true,
    listPriceCents: true,
    thumbnailUrl: true,
    publishedAt: true,
    createdAt: true,
    enrollmentCount: true,
    instructor: { select: { id: true, name: true, slug: true } },
    category: { select: { name: true, slug: true, accentColor: true } },
} as const;

type CatalogRow = {
    id: string;
    slug: string;
    title: string;
    level: string;
    durationHours: number;
    rating: number;
    reviewsCount: number;
    priceCents: number;
    listPriceCents: number;
    thumbnailUrl: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    enrollmentCount: number;
    instructor: { id: string; name: string; slug: string };
    category: { name: string; slug: string; accentColor: string };
};

function toCatalogCourse(row: CatalogRow): CatalogCourse {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        instructor: row.instructor.name,
        instructorSlug: row.instructor.slug,
        instructorId: row.instructor.id,
        categoryName: row.category.name,
        categorySlug: row.category.slug,
        art:
            categoryGradients[row.category.accentColor] ??
            FALLBACK_CATEGORY_GRADIENT,
        thumbnailUrl: row.thumbnailUrl,
        level: row.level,
        durationHours: row.durationHours,
        rating: row.rating,
        reviews: row.reviewsCount,
        students: row.enrollmentCount,
        price: row.priceCents / 100,
        listPrice: (row.listPriceCents || row.priceCents) / 100,
        publishedAtMs: (row.publishedAt ?? row.createdAt).getTime(),
    };
}

export const getCatalogCourses = cache(
    async function getCatalogCourses(): Promise<CatalogCourse[]> {
        const rows = await db.course.findMany({
            where: { status: "PUBLISHED" },
            orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
            select: catalogSelect,
        });
        return rows.map((row) => toCatalogCourse(row as CatalogRow));
    },
);

export const getCatalogCourse = cache(async function getCatalogCourse(
    slug: string,
): Promise<CatalogCourse | null> {
    const row = await db.course.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: catalogSelect,
    });
    return row ? toCatalogCourse(row as CatalogRow) : null;
});

export async function getCatalogCoursesBySlug(
    slugs: string[],
): Promise<Map<string, CatalogCourse>> {
    if (slugs.length === 0) return new Map();
    const rows = await db.course.findMany({
        where: { slug: { in: slugs }, status: "PUBLISHED" },
        select: catalogSelect,
    });
    return new Map(
        rows.map((row) => {
            const course = toCatalogCourse(row as CatalogRow);
            return [course.slug, course];
        }),
    );
}
