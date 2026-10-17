"use client";

import * as React from "react";
import Link from "next/link";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SearchIcon,
    StarIcon,
    UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    categoryIcons as databaseCategoryIcons,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import {
    instructorOverviewCards as copy,
    TOP_COURSES_PER_PAGE,
    type TopCourse,
} from "@/lib/config/instructor-overview";

function TopCoursesCard({ courses }: { courses: TopCourse[] }) {
    const [query, setQuery] = React.useState("");
    const [page, setPage] = React.useState(1);

    const visible = React.useMemo(() => {
        const needle = query.trim().toLowerCase();
        return needle
            ? courses.filter(
                  (course) =>
                      course.title.toLowerCase().includes(needle) ||
                      course.categoryName.toLowerCase().includes(needle),
              )
            : courses;
    }, [courses, query]);

    const pageCount = Math.max(
        1,
        Math.ceil(visible.length / TOP_COURSES_PER_PAGE),
    );
    const safePage = Math.min(page, pageCount);
    const rows = visible.slice(
        (safePage - 1) * TOP_COURSES_PER_PAGE,
        safePage * TOP_COURSES_PER_PAGE,
    );

    return (
        <Card className="gap-0 p-7 ring-border">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-base">{copy.top.title}</h2>
                <div className="relative w-full max-w-55">
                    <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setPage(1);
                        }}
                        placeholder={copy.top.search}
                        aria-label={copy.top.search}
                        className="h-10 rounded-full pl-9 md:text-[14px] dark:bg-background"
                    />
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="mt-6 grid flex-1 place-items-center rounded-xl border border-dashed px-5 py-12 text-center">
                    <div>
                        <p className="text-[15px] font-semibold">
                            {copy.top.emptyTitle}
                        </p>
                        <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] leading-5 text-muted-foreground">
                            {copy.top.emptyBody}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="h-11 px-0 text-[13px] font-normal text-muted-foreground">
                                    {copy.top.columns.name}
                                </TableHead>
                                <TableHead className="hidden h-11 text-[13px] font-normal text-muted-foreground sm:table-cell">
                                    {copy.top.columns.category}
                                </TableHead>
                                <TableHead className="h-11 text-[13px] font-normal text-muted-foreground">
                                    {copy.top.columns.score}
                                </TableHead>
                                <TableHead className="h-11 text-[13px] font-normal text-muted-foreground">
                                    {copy.top.columns.students}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((course) => {
                                const Icon =
                                    databaseCategoryIcons[
                                        course.categorySlug
                                    ] ?? FALLBACK_CATEGORY_ICON;
                                return (
                                    <TableRow key={course.slug}>
                                        <TableCell className="px-0 py-3.5">
                                            <Link
                                                href={`/dashboard/instructor/courses/${course.slug}`}
                                                className="flex items-center gap-3.5"
                                            >
                                                <span
                                                    className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-linear-to-br ${course.art}`}
                                                >
                                                    {course.thumbnailUrl ? (
                                                        <img
                                                            src={
                                                                course.thumbnailUrl
                                                            }
                                                            alt=""
                                                            className="absolute inset-0 size-full object-cover"
                                                        />
                                                    ) : (
                                                        <Icon className="size-5 text-white/70" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 truncate text-[15px] font-medium">
                                                    {course.title}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden text-[14px] text-muted-foreground sm:table-cell">
                                            {course.categoryName}
                                        </TableCell>
                                        <TableCell>
                                            {course.rating > 0 ? (
                                                <span className="flex items-center gap-1.5 text-[14px] font-semibold tabular-nums">
                                                    <StarIcon className="size-4 fill-star text-star" />
                                                    {course.rating.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1.5 text-[14px] tabular-nums">
                                                <UsersIcon className="size-4 text-muted-foreground" />
                                                {course.students.toLocaleString(
                                                    "en-US",
                                                )}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="mt-5 flex items-center justify-between">
                        <p className="text-[13px] text-muted-foreground">
                            {copy.top.count(visible.length)}
                        </p>
                        {pageCount > 1 ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Previous page"
                                    disabled={safePage <= 1}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        )
                                    }
                                    className="size-9 bg-card"
                                >
                                    <ChevronLeftIcon className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Next page"
                                    disabled={safePage >= pageCount}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(pageCount, current + 1),
                                        )
                                    }
                                    className="size-9 bg-card"
                                >
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </>
            )}
        </Card>
    );
}

export { TopCoursesCard };
