"use client";

import * as React from "react";

import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EnrolledCourseCard } from "@/components/dashboard/learning/enrolled-course-card";
import {
    LEARNING_PER_PAGE,
    learningTabs,
    type EnrolledCourse,
    type LearningTabValue,
} from "@/lib/config/my-learning-shape";
import { cn } from "@/lib/utils";

function EnrolledCoursesSection({
    courses: all,
}: {
    courses: EnrolledCourse[];
}) {
    const [tab, setTab] = React.useState<LearningTabValue>("in-progress");
    const [page, setPage] = React.useState(1);

    const courses =
        tab === "completed"
            ? all.filter((course) => course.completed)
            : all.filter((course) => !course.completed);

    const pageCount = Math.max(
        1,
        Math.ceil(courses.length / LEARNING_PER_PAGE),
    );
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * LEARNING_PER_PAGE;
    const visible = courses.slice(start, start + LEARNING_PER_PAGE);

    return (
        <div>
            <ToggleGroup
                value={[tab]}
                onValueChange={(value: string[]) => {
                    setTab(
                        (current) => (value[0] as LearningTabValue) ?? current,
                    );
                    setPage(1);
                }}
                aria-label="Filter enrolled courses"
                className="gap-0 rounded-lg bg-track p-1"
            >
                {learningTabs.map((entry) => (
                    <ToggleGroupItem
                        key={entry.value}
                        value={entry.value}
                        size="lg"
                        className="gap-2 rounded-md px-4 text-muted-foreground aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
                    >
                        {entry.label}
                        <span className="text-subtle-foreground tabular-nums group-aria-pressed/toggle:text-primary-foreground/70">
                            {
                                (entry.value === "completed"
                                    ? all.filter((course) => course.completed)
                                    : all.filter((course) => !course.completed)
                                ).length
                            }
                        </span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            {visible.length > 0 ? (
                <div className="mt-6 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
                    {visible.map((course) => (
                        <EnrolledCourseCard key={course.slug} course={course} />
                    ))}
                </div>
            ) : (
                <Empty className="mt-6 border">
                    <EmptyHeader>
                        <EmptyTitle>Nothing Here Yet</EmptyTitle>
                        <EmptyDescription>
                            Courses You Enrol In Show Up Here So You Can Pick Up
                            Where You Left Off.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {courses.length > 0 ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {start + 1}–
                        {Math.min(start + LEARNING_PER_PAGE, courses.length)} Of{" "}
                        {courses.length} Courses
                    </p>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className={cn(
                                        "bg-card",
                                        safePage <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        );
                                    }}
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: pageCount },
                                (_, index) => index + 1,
                            ).map((pageNumber) => (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        isActive={pageNumber === safePage}
                                        className={cn(
                                            pageNumber === safePage
                                                ? "border-transparent! bg-primary! text-primary-foreground! hover:bg-primary/80! hover:text-white!"
                                                : "bg-card",
                                        )}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setPage(pageNumber);
                                        }}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    className={cn(
                                        "bg-card",
                                        safePage >= pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setPage((current) =>
                                            Math.min(pageCount, current + 1),
                                        );
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}
        </div>
    );
}

export { EnrolledCoursesSection };
