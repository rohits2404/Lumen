"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CourseArt } from "@/components/dashboard/course-art";
import { RequestChangesDialog } from "@/components/dashboard/admin/courses/request-changes-dialog";
import {
    approveCourse,
    requestCourseChanges,
} from "@/lib/actions/admin-courses";
import {
    adminCoursesCopy,
    awaitsDecision,
    COURSES_PAGE_SIZE,
    courseTabs,
    isCoursesFiltered,
} from "@/lib/config/admin-courses";
import { courseStatusBadge } from "@/lib/config/course-status";
import type {
    CoursesPage,
    CoursesQuery,
    CoursesTab,
} from "@/lib/admin/courses";
import { cn } from "@/lib/utils";

export type CourseListRow = {
    id: string;
    slug: string;
    title: string;
    status: CoursesPage["rows"][number]["status"];
    instructorName: string;
    lessonCount: number;
    submittedLabel: string | null;
    thumbnailUrl: string | null;
    categorySlug: string;
    categoryAccent: string;
};

function CoursesList({
    rows,
    page,
    query,
}: {
    rows: CourseListRow[];
    page: CoursesPage;
    query: CoursesQuery;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();
    const [saving, startSaving] = React.useTransition();
    const [requesting, setRequesting] = React.useState<CourseListRow | null>(
        null,
    );
    const [approving, setApproving] = React.useState<string | null>(null);

    const pending = isPending || saving;

    const hrefFor = React.useCallback(
        (next: number) => {
            const params = new URLSearchParams(searchParams);
            if (next <= 1) params.delete("page");
            else params.set("page", String(next));
            const search = params.toString();
            return search ? `${pathname}?${search}` : pathname;
        },
        [pathname, searchParams],
    );

    function selectTab(next: CoursesTab) {
        const params = new URLSearchParams(searchParams);
        if (next === "all") params.delete("tab");
        else params.set("tab", next);
        params.delete("page");
        const search = params.toString();
        startTransition(() => {
            router.replace(search ? `${pathname}?${search}` : pathname, {
                scroll: false,
            });
        });
    }

    function approve(row: CourseListRow) {
        setApproving(row.id);
        startSaving(async () => {
            const result = await approveCourse(row.id);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            setApproving(null);
        });
    }

    function sendBack(input: { reasons: string[]; note: string }) {
        const row = requesting;
        if (!row) return;
        startSaving(async () => {
            const result = await requestCourseChanges(row.id, input);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setRequesting(null);
        });
    }

    const from = (page.page - 1) * COURSES_PAGE_SIZE + 1;

    return (
        <>
            <ToggleGroup
                value={[query.tab]}
                onValueChange={(next: string[]) => {
                    const chosen = next[0] as CoursesTab | undefined;
                    if (!chosen || chosen === query.tab) return;
                    selectTab(chosen);
                }}
                aria-label="Filter courses by status"
                className="mt-6 h-10 w-fit gap-0 rounded-lg bg-track p-1"
            >
                {courseTabs.map((tab) => (
                    <ToggleGroupItem
                        key={tab.value}
                        value={tab.value}
                        size="lg"
                        className="gap-2 rounded-md px-4 text-muted-foreground aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
                    >
                        {tab.label}
                        <span className="text-subtle-foreground tabular-nums group-aria-pressed/toggle:text-primary-foreground/70">
                            {page.counts[tab.value]}
                        </span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            {rows.length === 0 ? (
                <Card className="mt-5 items-center gap-3 px-6 py-20 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminCoursesCopy.emptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminCoursesCopy.emptyDescription}
                    </p>
                    {isCoursesFiltered(query) ? (
                        <Button
                            variant="outline"
                            nativeButton={false}
                            className="mt-1 h-9 bg-card shadow-sm"
                            render={<Link href={pathname} />}
                        >
                            {adminCoursesCopy.clearFilters}
                        </Button>
                    ) : null}
                </Card>
            ) : (
                <div
                    className={cn(
                        "mt-5 flex flex-col gap-5",
                        pending &&
                            "pointer-events-none opacity-60 transition-opacity",
                    )}
                >
                    {rows.map((row) => {
                        const badge = courseStatusBadge(row.status);
                        const decidable = awaitsDecision(row.status);

                        return (
                            <Card
                                key={row.id}
                                className="flex-row items-center gap-4 p-3.5 ring-border"
                            >
                                <CourseArt
                                    thumbnailUrl={row.thumbnailUrl}
                                    categorySlug={row.categorySlug}
                                    categoryAccent={row.categoryAccent}
                                    className="h-18.5 w-30 rounded-lg"
                                    iconClassName="size-7"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="truncate text-lg font-bold">
                                            {row.title}
                                        </h2>
                                        <span
                                            className={cn(
                                                "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium",
                                                badge.className,
                                            )}
                                        >
                                            {badge.label}
                                        </span>
                                    </div>

                                    <p className="mt-2 flex flex-wrap items-center gap-x-4 text-[15px] text-muted-foreground">
                                        <span>{row.instructorName}</span>
                                        <span>
                                            {row.lessonCount}{" "}
                                            {row.lessonCount === 1
                                                ? "lesson"
                                                : "lessons"}
                                        </span>
                                        {row.submittedLabel ? (
                                            <span className="text-subtle-foreground">
                                                {row.submittedLabel}
                                            </span>
                                        ) : null}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2.5">
                                    {decidable ? (
                                        <>
                                            <Button
                                                loading={approving === row.id}
                                                disabled={saving}
                                                onClick={() => approve(row)}
                                                className="h-10 gap-2 px-4"
                                            >
                                                <CheckIcon className="size-4" />
                                                {adminCoursesCopy.approve}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                disabled={saving}
                                                onClick={() =>
                                                    setRequesting(row)
                                                }
                                                className="h-10 bg-card px-4 shadow-sm"
                                            >
                                                {
                                                    adminCoursesCopy.requestChanges
                                                }
                                            </Button>
                                        </>
                                    ) : null}
                                    <Button
                                        variant="outline"
                                        nativeButton={false}
                                        className="h-10 bg-card px-4 shadow-sm"
                                        render={
                                            <Link
                                                href={`/dashboard/admin/courses/${row.slug}`}
                                            />
                                        }
                                    >
                                        {adminCoursesCopy.view}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[13px] text-muted-foreground">
                    {page.total === 0
                        ? adminCoursesCopy.emptyTitle
                        : adminCoursesCopy.showing(
                              from,
                              from + rows.length - 1,
                              page.total,
                          )}
                </p>

                {page.pageCount > 1 ? (
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={hrefFor(page.page - 1)}
                                    className={cn(
                                        "bg-card",
                                        page.page <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: page.pageCount },
                                (_, index) => index + 1,
                            )
                                .filter(
                                    (entry) =>
                                        entry === 1 ||
                                        entry === page.pageCount ||
                                        Math.abs(entry - page.page) <= 1,
                                )
                                .flatMap((entry, index, list) =>
                                    index > 0 && entry - list[index - 1]! > 1
                                        ? [null, entry]
                                        : [entry],
                                )
                                .map((entry, index) =>
                                    entry === null ? (
                                        <PaginationItem key={`gap-${index}`}>
                                            <span className="px-2 text-sm text-muted-foreground">
                                                …
                                            </span>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={entry}>
                                            <PaginationLink
                                                href={hrefFor(entry)}
                                                isActive={entry === page.page}
                                                className={cn(
                                                    entry === page.page
                                                        ? "border-transparent! bg-primary! text-primary-foreground! hover:bg-primary/80! hover:text-white!"
                                                        : "bg-card",
                                                )}
                                            >
                                                {entry}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}
                            <PaginationItem>
                                <PaginationNext
                                    href={hrefFor(page.page + 1)}
                                    className={cn(
                                        "bg-card",
                                        page.page >= page.pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                ) : null}
            </div>

            <RequestChangesDialog
                open={requesting !== null}
                onOpenChange={(open) => {
                    if (!open) setRequesting(null);
                }}
                courseTitle={requesting?.title ?? ""}
                instructorName={requesting?.instructorName ?? ""}
                pending={saving}
                onSubmit={sendBack}
            />
        </>
    );
}

export { CoursesList };
