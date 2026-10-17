"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    DownloadIcon,
    SearchIcon,
    SendIcon,
    UsersIcon,
    XIcon,
} from "lucide-react";

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CourseFilter } from "@/components/dashboard/instructor/course-filter";
import { MessageAllDialog } from "@/components/dashboard/instructor/students/message-all-dialog";
import { StudentTableRow } from "@/components/dashboard/instructor/students/student-row";
import {
    exportStudentsCsv,
    messageAllStudents,
    openStudentConversation,
    type StudentsFilter,
} from "@/lib/actions/instructor-students";
import {
    isStudentsFiltered,
    STUDENTS_PAGE_SIZE,
    studentsCopy,
    studentTabs,
    type StudentTab,
} from "@/lib/config/instructor-students";
import type { StudentsPage } from "@/lib/instructor-students";
import { cn } from "@/lib/utils";

const CONTROL = "h-[42px]";

const SEARCH_DEBOUNCE_MS = 300;

function StudentsBoard({
    page,
    children,
}: {
    page: StudentsPage;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isPending, startTransition] = React.useTransition();
    const [working, startWorking] = React.useTransition();
    const [busy, setBusy] = React.useState<
        | { kind: "message"; id: string }
        | { kind: "export" }
        | { kind: "all" }
        | null
    >(null);
    const [messageAllOpen, setMessageAllOpen] = React.useState(false);

    const push = React.useCallback(
        (changes: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams);
            for (const [key, next] of Object.entries(changes)) {
                if (next === null || next === "") params.delete(key);
                else params.set(key, next);
            }
            params.delete("page");
            const query = params.toString();
            startTransition(() => {
                router.replace(query ? `${pathname}?${query}` : pathname, {
                    scroll: false,
                });
            });
        },
        [pathname, router, searchParams],
    );

    const hrefFor = React.useCallback(
        (next: number) => {
            const params = new URLSearchParams(searchParams);
            if (next <= 1) params.delete("page");
            else params.set("page", String(next));
            const query = params.toString();
            return query ? `${pathname}?${query}` : pathname;
        },
        [pathname, searchParams],
    );

    const [value, setValue] = React.useState(page.query.query);
    const [lastQuery, setLastQuery] = React.useState(page.query.query);
    if (page.query.query !== lastQuery) {
        setLastQuery(page.query.query);
        setValue(page.query.query);
    }

    React.useEffect(() => {
        if (value === page.query.query) return;
        const timer = setTimeout(
            () => push({ q: value || null }),
            SEARCH_DEBOUNCE_MS,
        );
        return () => clearTimeout(timer);
    }, [value, page.query.query, push]);

    const filter: StudentsFilter = {
        tab: page.query.tab,
        ...(page.query.courseId ? { course: page.query.courseId } : {}),
        ...(page.query.query ? { q: page.query.query } : {}),
    };

    function message(enrollmentId: string) {
        setBusy({ kind: "message", id: enrollmentId });
        startWorking(async () => {
            const result = await openStudentConversation(enrollmentId);
            setBusy(null);
            if (!result.ok || !result.conversationId) {
                toast.add({ title: result.message, type: "error" });
                return;
            }
            router.push(
                `/dashboard/instructor/messages?c=${result.conversationId}`,
            );
        });
    }

    function exportCsv() {
        setBusy({ kind: "export" });
        startWorking(async () => {
            const result = await exportStudentsCsv(filter);
            setBusy(null);
            if (!result.ok || !result.csv) {
                toast.add({ title: result.message, type: "error" });
                return;
            }
            download(result.csv);
            toast.add({
                title: result.truncated
                    ? studentsCopy.exportTruncated(result.rows ?? 0)
                    : studentsCopy.exported(result.rows ?? 0),
                type: result.truncated ? "warning" : "success",
            });
        });
    }

    function sendToAll(body: string) {
        setBusy({ kind: "all" });
        startWorking(async () => {
            const result = await messageAllStudents(filter, body);
            setBusy(null);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setMessageAllOpen(false);
        });
    }

    const from =
        page.total === 0 ? 0 : (page.page - 1) * STUDENTS_PAGE_SIZE + 1;
    const to = from === 0 ? 0 : from + page.rows.length - 1;
    const filtered = isStudentsFiltered(page.query);

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[32px] leading-none font-bold">
                        {studentsCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {studentsCopy.description}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        loading={busy?.kind === "export" && working}
                        disabled={page.total === 0}
                        onClick={exportCsv}
                        className="h-10 gap-2 bg-card px-4 shadow-sm"
                    >
                        <DownloadIcon className="size-4" />
                        {studentsCopy.exportCsv}
                    </Button>
                    <Button
                        type="button"
                        disabled={page.total === 0}
                        onClick={() => setMessageAllOpen(true)}
                        className="h-10 gap-2 px-4"
                    >
                        <SendIcon className="size-4" />
                        {studentsCopy.messageAll}
                    </Button>
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {children}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <ToggleGroup
                    value={[page.query.tab]}
                    onValueChange={(next: string[]) => {
                        const chosen = next[0] as StudentTab | undefined;
                        if (!chosen || chosen === page.query.tab) return;
                        push({ tab: chosen === "all" ? null : chosen });
                    }}
                    aria-label="Filter students by progress"
                    className={cn(CONTROL, "gap-0 rounded-lg bg-track p-1")}
                >
                    {studentTabs.map((tab) => (
                        <ToggleGroupItem
                            key={tab.value}
                            value={tab.value}
                            size="lg"
                            className="rounded-md px-4 text-muted-foreground aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
                        >
                            {tab.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                <div className="ml-auto flex flex-wrap items-center gap-2.5">
                    <CourseFilter
                        courses={page.courses}
                        value={page.query.courseId}
                        onValueChange={(courseId) => push({ course: courseId })}
                        label={studentsCopy.allCourses}
                        className={cn(
                            CONTROL,
                            "w-47.5 data-[size=default]:h-10.5",
                        )}
                    />

                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle-foreground" />
                        <Input
                            type="search"
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            placeholder={studentsCopy.searchPlaceholder}
                            aria-label={studentsCopy.searchPlaceholder}
                            className={cn(
                                CONTROL,
                                "w-full rounded-lg bg-card pr-10 pl-10.5 text-[14px] sm:w-50 md:text-[14px] dark:bg-card",
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
            </div>

            {page.total === 0 && !filtered ? (
                <Card className="mt-4 p-0 ring-border [--card-spacing:0px]">
                    <Empty className="py-16">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <UsersIcon />
                            </EmptyMedia>
                            <EmptyTitle>{studentsCopy.empty.title}</EmptyTitle>
                            <EmptyDescription>
                                {studentsCopy.empty.description}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </Card>
            ) : (
                <Card
                    className={cn(
                        "mt-4 overflow-hidden p-0 ring-border [--card-spacing:0px]",
                        isPending && "opacity-60",
                    )}
                >
                    <Table className="min-w-245 border-b border-border-subtle">
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                {[
                                    "Student",
                                    "Course",
                                    "Progress",
                                    "Quiz",
                                    "Last Active",
                                ].map((heading) => (
                                    <TableHead
                                        key={heading}
                                        className="h-10.75 px-5 text-[13px] font-medium text-muted-foreground"
                                    >
                                        {heading}
                                    </TableHead>
                                ))}
                                <TableHead className="px-5">
                                    <span className="sr-only">Message</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {page.rows.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-[14px] text-muted-foreground"
                                    >
                                        {studentsCopy.noMatches}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                page.rows.map((row) => (
                                    <StudentTableRow
                                        key={row.id}
                                        row={row}
                                        busy={
                                            working &&
                                            busy?.kind === "message" &&
                                            busy.id === row.id
                                        }
                                        onMessage={() => message(row.id)}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {page.total > 0 ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[13px] text-muted-foreground">
                        {studentsCopy.showing(from, to, page.total)}
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

            <MessageAllDialog
                open={messageAllOpen}
                onOpenChange={setMessageAllOpen}
                recipients={page.total}
                pending={working && busy?.kind === "all"}
                onSubmit={sendToAll}
            />
        </>
    );
}

function download(csv: string) {
    const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export { StudentsBoard };
