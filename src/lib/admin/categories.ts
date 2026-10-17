import { cache } from "react";

import { db } from "@/lib/db";

export type CategoryRow = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    accentColor: string;
    showInNav: boolean;
    courseCount: number;
    studentCount: number;
    share: number;
    childCount: number;
};

export type CategoriesPage = {
    rows: CategoryRow[];
    totalStudents: number;
};

export const getCategoriesPage = cache(
    async function getCategoriesPage(): Promise<CategoriesPage> {
        const [categories, grouped] = await Promise.all([
            db.category.findMany({
                where: { parentId: null },
                orderBy: [{ order: "asc" }, { name: "asc" }],
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    accentColor: true,
                    showInNav: true,
                    children: { select: { id: true } },
                },
            }),
            db.course.groupBy({
                by: ["categoryId"],
                _count: { _all: true },
                _sum: { enrollmentCount: true },
            }),
        ]);

        const byCategory = new Map(
            grouped.map((entry) => [
                entry.categoryId,
                {
                    courses: entry._count._all,
                    students: entry._sum.enrollmentCount ?? 0,
                },
            ]),
        );

        const totals = categories.map((category) => {
            const ids = [
                category.id,
                ...category.children.map((child) => child.id),
            ];
            return ids.reduce(
                (sum, id) => {
                    const entry = byCategory.get(id);
                    return {
                        courses: sum.courses + (entry?.courses ?? 0),
                        students: sum.students + (entry?.students ?? 0),
                    };
                },
                { courses: 0, students: 0 },
            );
        });

        const totalStudents = totals.reduce(
            (sum, entry) => sum + entry.students,
            0,
        );

        return {
            rows: categories.map((category, index) => ({
                id: category.id,
                slug: category.slug,
                name: category.name,
                description: category.description,
                accentColor: category.accentColor,
                showInNav: category.showInNav,
                courseCount: totals[index]!.courses,
                studentCount: totals[index]!.students,
                share:
                    totalStudents === 0
                        ? 0
                        : Math.round(
                              (totals[index]!.students / totalStudents) * 100,
                          ),
                childCount: category.children.length,
            })),
            totalStudents,
        };
    },
);
