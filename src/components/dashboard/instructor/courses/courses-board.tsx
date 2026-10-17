"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpenTextIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MyCourseRow } from "@/components/dashboard/instructor/courses/my-course-row";
import {
    COURSES_PAGE_SIZE,
    isMyCoursesFiltered,
    myCoursesCopy,
    myCoursesTabs,
} from "@/lib/config/instructor-courses";
import type {
    InstructorCoursesPage,
    MyCoursesTab,
} from "@/lib/instructor-courses";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

const CONTROL = "h-[42px]";

function CoursesBoard({
    page,
    authoringBuilt,
    children,
}: {
    page: InstructorCoursesPage;
    authoringBuilt: boolean;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();

    const [value, setValue] = React.useState(page.query.query);
    const [lastQuery, setLastQuery] = React.useState(page.query.query);
    if (page.query.query !== lastQuery) {
        setLastQuery(page.query.query);
        setValue(page.query.query);
    }

    const push = React.useCallback(
        (changes: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams);
            for (const [key, next] of Object.entries(changes)) {
                if (next === null || next === "") params.delete(key);
                else params.set(key, next);
            }
            params.delete("page");
            const search = params.toString();
            startTransition(() => {
                router.replace(search ? `${pathname}?${search}` : pathname, {
                    scroll: false,
                });
            });
        },
        [pathname, router, searchParams],
    );

    React.useEffect(() => {
        if (value === page.query.query) return;
        const timer = setTimeout(
            () => push({ q: value || null }),
            SEARCH_DEBOUNCE_MS,
        );
        return () => clearTimeout(timer);
    }, [value, page.query.query, push]);

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

    const from = page.total === 0 ? 0 : (page.page - 1) * COURSES_PAGE_SIZE + 1;
    const to = from === 0 ? 0 : from + page.rows.length - 1;
    const filtered = isMyCoursesFiltered(page.query);

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[32px] leading-none font-bold">
                        {myCoursesCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {myCoursesCopy.description}
                    </p>
                </div>

                <Button
                    type="button"
                    disabled={!authoringBuilt}
                    title={
                        authoringBuilt
                            ? undefined
                            : myCoursesCopy.authoringUnavailable
                    }
                    className="h-10 shrink-0 gap-2 px-4"
                >
                    <PlusIcon className="size-4" />
                    {myCoursesCopy.createCourse}
                </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {children}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <ToggleGroup
                    value={[page.query.tab]}
                    onValueChange={(next: string[]) => {
                        const chosen = next[0] as MyCoursesTab | undefined;
                        if (!chosen || chosen === page.query.tab) return;
                        push({ tab: chosen === "all" ? null : chosen });
                    }}
                    aria-label="Filter courses by status"
                    className={cn(CONTROL, "gap-1.5 rounded-lg bg-track p-1")}
                >
                    {myCoursesTabs.map((tab) => (
                        <ToggleGroupItem
                            key={tab.value}
                            value={tab.value}
                            size="lg"
                            className="h-8.5 rounded-md px-4 text-[14px] text-muted-foreground aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
                        >
                            {tab.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                <div className="relative ml-auto">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle-foreground" />
                    <Input
                        type="search"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={myCoursesCopy.searchPlaceholder}
                        aria-label={myCoursesCopy.searchPlaceholder}
                        className={cn(
                            CONTROL,
                            "w-full rounded-lg bg-card pr-10 pl-10.5 text-[14px] sm:w-55 md:text-[14px] dark:bg-card",
                        )}
                    />
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        {isPending ? (
                            <Spinner className="size-4 text-subtle-foreground" />
                        ) : value ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("");
                                    push({ q: null });
                                }}
                                aria-label="Clear search"
                                className="grid size-5 cursor-pointer place-items-center rounded-full text-subtle-foreground transition-colors hover:bg-hover hover:text-foreground"
                            >
                                <XIcon className="size-3.5" />
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {page.total === 0 && !filtered ? (
                <Card className="mt-4 p-0 ring-border [--card-spacing:0px]">
                    <Empty className="py-16">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <BookOpenTextIcon />
                            </EmptyMedia>
                            <EmptyTitle>{myCoursesCopy.empty.title}</EmptyTitle>
                            <EmptyDescription>
                                {myCoursesCopy.empty.description}
                            </EmptyDescription>
                        </EmptyHeader>
                        <Button
                            type="button"
                            disabled={!authoringBuilt}
                            title={
                                authoringBuilt
                                    ? undefined
                                    : myCoursesCopy.authoringUnavailable
                            }
                            className="h-10 gap-2 px-4"
                        >
                            <PlusIcon className="size-4" />
                            {myCoursesCopy.createCourse}
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <div
                    className={cn(
                        "mt-4 flex flex-col gap-4",
                        isPending && "opacity-60 transition-opacity",
                    )}
                >
                    {page.rows.length === 0 ? (
                        <Card className="p-0 ring-border [--card-spacing:0px]">
                            <p className="px-5 py-10 text-center text-[14px] text-muted-foreground">
                                {myCoursesCopy.noMatches}
                            </p>
                        </Card>
                    ) : (
                        page.rows.map((course) => (
                            <MyCourseRow key={course.id} course={course} />
                        ))
                    )}
                </div>
            )}

            {page.total > 0 ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[13px] text-muted-foreground">
                        {myCoursesCopy.showing(from, to, page.total)}
                    </p>
                    {page.pageCount > 1 ? (
                        <Pagination className="mx-0 w-auto justify-end">
                            <PaginationContent className="gap-2">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={hrefFor(page.page - 1)}
                                        aria-disabled={page.page <= 1}
                                        className={cn(
                                            "h-9",
                                            page.page <= 1 &&
                                                "pointer-events-none opacity-50",
                                        )}
                                    />
                                </PaginationItem>
                                {Array.from(
                                    { length: page.pageCount },
                                    (_, index) => (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                href={hrefFor(index + 1)}
                                                isActive={
                                                    index + 1 === page.page
                                                }
                                                className={cn(
                                                    "size-9",
                                                    index + 1 === page.page &&
                                                        "bg-primary! text-primary-foreground!",
                                                )}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}
                                <PaginationItem>
                                    <PaginationNext
                                        href={hrefFor(page.page + 1)}
                                        aria-disabled={
                                            page.page >= page.pageCount
                                        }
                                        className={cn(
                                            "h-9",
                                            page.page >= page.pageCount &&
                                                "pointer-events-none opacity-50",
                                        )}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}

export { CoursesBoard };
