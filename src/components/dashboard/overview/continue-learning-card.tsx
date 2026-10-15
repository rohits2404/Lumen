"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
    SearchIcon,
    StarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    CONTINUE_THRESHOLD,
    type ContinueLearningCourse,
} from "@/lib/config/dashboard-overview-shape";

function ProgressCell({ progress }: { progress: number }) {
    if (progress < CONTINUE_THRESHOLD) {
        return (
            <div className="flex items-center justify-end gap-3">
                <Progress
                    value={progress}
                    className="w-10 **:data-[slot=progress-indicator]:bg-bar-fill **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:bg-track"
                />
                <Button
                    size="sm"
                    nativeButton={false}
                    className="h-8 gap-1 px-3! text-xs font-semibold"
                    render={<Link href="/dashboard/learning" />}
                >
                    Continue
                    <ArrowRightIcon
                        data-icon="inline-end"
                        className="size-3.5"
                    />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-end gap-3">
            <Progress
                value={progress}
                className="w-24 **:data-[slot=progress-indicator]:bg-bar-fill **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:bg-track"
            />
            <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More options"
                className="text-subtle-foreground"
            >
                <MoreHorizontalIcon />
            </Button>
        </div>
    );
}

function ContinueLearningCard({
    courses,
}: {
    courses: ContinueLearningCourse[];
}) {
    const [query, setQuery] = React.useState("");

    const visible = courses.filter((course) =>
        course.title.toLowerCase().includes(query.trim().toLowerCase()),
    );

    return (
        <Card className="gap-0 p-6.5 ring-border">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-base">Continue Learning</h2>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle-foreground" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search Courses"
                        className="h-9 w-50 rounded-lg border bg-card py-1.5 pr-3 pl-9 text-[13px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                </div>
            </div>

            <Table className="mt-5">
                <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                        <TableHead className="h-9 px-0 text-[13px] font-normal text-muted-foreground">
                            Course Name
                        </TableHead>
                        <TableHead className="h-9 px-3 text-[13px] font-normal text-muted-foreground">
                            Category
                        </TableHead>
                        <TableHead className="h-9 px-3 text-[13px] font-normal text-muted-foreground">
                            Score
                        </TableHead>
                        <TableHead className="h-9 px-0 text-right text-[13px] font-normal text-muted-foreground">
                            Progress
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visible.map((course) => (
                        <TableRow
                            key={course.slug}
                            className="border-border-subtle hover:bg-transparent"
                        >
                            <TableCell className="px-0 py-3">
                                <Link
                                    href={`/dashboard/learning/${course.slug}`}
                                    className="flex items-center gap-3"
                                >
                                    <span
                                        className={`grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br text-white ${course.art}`}
                                    >
                                        {(() => {
                                            const Icon =
                                                databaseCategoryIcons[
                                                    course.categorySlug
                                                ] ?? FALLBACK_CATEGORY_ICON;
                                            return <Icon className="size-4" />;
                                        })()}
                                    </span>
                                    <span className="font-medium text-wrap">
                                        {course.title}
                                    </span>
                                </Link>
                            </TableCell>
                            <TableCell className="px-3 text-sm text-wrap text-muted-foreground">
                                {course.category}
                            </TableCell>
                            <TableCell className="px-3">
                                <span className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                                    <StarIcon className="size-3.5 fill-star text-star" />
                                    {course.score.toFixed(1)}
                                </span>
                            </TableCell>
                            <TableCell className="px-0">
                                <ProgressCell progress={course.progress} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {visible.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    No Courses Match “{query}”.
                </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
                <p className="text-[13px] text-muted-foreground">
                    {courses.length} course(s)
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        disabled
                        aria-label="Previous page"
                        className="bg-card"
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        disabled
                        aria-label="Next page"
                        className="bg-card"
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export { ContinueLearningCard };
