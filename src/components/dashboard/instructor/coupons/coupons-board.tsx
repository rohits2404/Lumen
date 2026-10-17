"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/toast";
import { CourseFilter } from "@/components/dashboard/instructor/course-filter";
import { CouponDialog } from "@/components/dashboard/instructor/coupons/coupon-dialog";
import {
    couponSchedule,
    formatMoney,
    formatRedemptions,
    redemptionFraction,
} from "@/components/dashboard/instructor/coupons/coupons-format";
import {
    createCoupon,
    updateCoupon,
    type CouponInput,
} from "@/lib/actions/instructor-coupons";
import {
    COUPONS_PAGE_SIZE,
    couponStatusBadge,
    couponStatusLabel,
    couponTabs,
    couponsCopy,
    type CouponTab,
} from "@/lib/config/instructor-coupons";
import type { CouponRow, CouponsPage } from "@/lib/instructor-coupons";
import { cn } from "@/lib/utils";

const CONTROL = "h-[42px]";

function CouponsBoard({
    page,
    revenueShareBps,
    children,
}: {
    page: CouponsPage;
    revenueShareBps: number;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();
    const [saving, startSaving] = React.useTransition();
    const [dialog, setDialog] = React.useState<
        { open: false } | { open: true; coupon: CouponRow | null }
    >({ open: false });

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

    function submit(input: CouponInput) {
        const editing = dialog.open ? dialog.coupon : null;
        startSaving(async () => {
            const result = editing
                ? await updateCoupon(editing.id, input)
                : await createCoupon(input);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) setDialog({ open: false });
        });
    }

    const from = page.total === 0 ? 0 : (page.page - 1) * COUPONS_PAGE_SIZE + 1;
    const to = from === 0 ? 0 : from + page.rows.length - 1;
    const filtered = page.query.tab !== "all" || page.query.courseId !== null;

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[32px] leading-none font-bold">
                        {couponsCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {couponsCopy.description}
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => setDialog({ open: true, coupon: null })}
                    disabled={page.courses.length === 0}
                    className="h-10 shrink-0 gap-2 px-4"
                >
                    <PlusIcon className="size-4" />
                    {couponsCopy.newCoupon}
                </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {children}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <ToggleGroup
                    value={[page.query.tab]}
                    onValueChange={(next: string[]) => {
                        const chosen = next[0] as CouponTab | undefined;
                        if (!chosen || chosen === page.query.tab) return;
                        push({ tab: chosen === "all" ? null : chosen });
                    }}
                    aria-label="Filter coupons by status"
                    className={cn(CONTROL, "gap-0 rounded-lg bg-track p-1")}
                >
                    {couponTabs.map((tab) => (
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

                <div className="ml-auto">
                    <CourseFilter
                        courses={page.courses}
                        value={page.query.courseId}
                        onValueChange={(courseId) => push({ course: courseId })}
                        label={couponsCopy.allCourses}
                        className={cn(
                            CONTROL,
                            "w-47.5 data-[size=default]:h-10.5",
                        )}
                    />
                </div>
            </div>

            {page.total === 0 && !filtered ? (
                <Card className="mt-4 p-0 [--card-spacing:0px]">
                    <Empty className="py-16">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PlusIcon />
                            </EmptyMedia>
                            <EmptyTitle>{couponsCopy.empty.title}</EmptyTitle>
                            <EmptyDescription>
                                {couponsCopy.empty.description}
                            </EmptyDescription>
                        </EmptyHeader>
                        <Button
                            type="button"
                            onClick={() =>
                                setDialog({ open: true, coupon: null })
                            }
                            disabled={page.courses.length === 0}
                            className="h-10 gap-2 px-4"
                        >
                            <PlusIcon className="size-4" />
                            {couponsCopy.newCoupon}
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Card
                    className={cn(
                        "mt-4 overflow-hidden p-0 [--card-spacing:0px]",
                        isPending && "opacity-60",
                    )}
                >
                    <Table className="min-w-225 border-b border-border-subtle">
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                {[
                                    "Code",
                                    "Course",
                                    "Discount",
                                    "Price",
                                    "Redemptions",
                                    "Revenue",
                                ].map((heading) => (
                                    <TableHead
                                        key={heading}
                                        className="h-10.75 px-5 text-[13px] font-medium text-muted-foreground"
                                    >
                                        {heading}
                                    </TableHead>
                                ))}
                                <TableHead className="px-5">
                                    <span className="sr-only">
                                        {couponsCopy.edit}
                                    </span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {page.rows.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={7}
                                        className="px-5 py-10 text-center text-[14px] text-muted-foreground"
                                    >
                                        {couponsCopy.noMatches}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                page.rows.map((row) => (
                                    <CouponTableRow
                                        key={row.id}
                                        row={row}
                                        now={page.generatedAt}
                                        onEdit={() =>
                                            setDialog({
                                                open: true,
                                                coupon: row,
                                            })
                                        }
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
                        {couponsCopy.showing(from, to, page.total)}
                    </p>
                    <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
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
                                            isActive={index + 1 === page.page}
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
                                    aria-disabled={page.page >= page.pageCount}
                                    className={cn(
                                        "h-9",
                                        page.page >= page.pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}

            <CouponDialog
                open={dialog.open}
                onOpenChange={(next) =>
                    setDialog(
                        next ? { open: true, coupon: null } : { open: false },
                    )
                }
                courses={page.courses}
                coupon={dialog.open ? dialog.coupon : null}
                revenueShareBps={revenueShareBps}
                pending={saving}
                onSubmit={submit}
            />
        </>
    );
}

function CouponTableRow({
    row,
    now,
    onEdit,
}: {
    row: CouponRow;
    now: Date;
    onEdit: () => void;
}) {
    const schedule = couponSchedule(row.startsAt, row.endsAt, now);
    const fraction = redemptionFraction(row.redemptions, row.redemptionLimit);

    return (
        <TableRow className="h-18 border-border-subtle hover:bg-transparent">
            <TableCell className="px-5">
                <div className="grid gap-1.5">
                    <span className="text-[14px] leading-none font-bold tracking-[0.01em]">
                        {row.code}
                    </span>
                    <span
                        className={cn(
                            "inline-flex h-5 w-fit items-center rounded-full px-2 text-[12px] font-medium",
                            couponStatusBadge[row.status],
                        )}
                    >
                        {couponStatusLabel[row.status]}
                    </span>
                </div>
            </TableCell>
            <TableCell className="px-5 text-[14px] text-muted-foreground">
                {row.courseTitle}
            </TableCell>
            <TableCell className="px-5 text-[14px] font-semibold tabular-nums">
                {row.percentOff}% off
            </TableCell>
            <TableCell className="px-5 text-[15px] font-semibold tabular-nums">
                {formatMoney(row.priceCents)}
            </TableCell>
            <TableCell className="px-5">
                <div className="grid gap-1.5">
                    <div className="flex items-center gap-3">
                        <span
                            className="h-1.5 w-49 shrink-0 overflow-hidden rounded-full bg-track"
                            role="presentation"
                        >
                            <span
                                className="block h-full rounded-full bg-primary"
                                style={{ width: `${fraction * 100}%` }}
                            />
                        </span>
                        <span className="text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
                            {formatRedemptions(
                                row.redemptions,
                                row.redemptionLimit,
                            )}
                        </span>
                    </div>
                    {schedule ? (
                        <span className="text-[12px] text-muted-foreground">
                            {schedule}
                        </span>
                    ) : null}
                </div>
            </TableCell>
            <TableCell className="px-5 text-[16px] font-bold tabular-nums">
                {row.redemptions === 0 ? (
                    <span className="text-muted-foreground">—</span>
                ) : (
                    formatMoney(row.revenueCents)
                )}
            </TableCell>
            <TableCell className="px-5 text-right">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onEdit}
                    className="h-8.25 bg-card px-4 text-[14px] shadow-sm"
                >
                    {couponsCopy.edit}
                </Button>
            </TableCell>
        </TableRow>
    );
}

export { CouponsBoard };
