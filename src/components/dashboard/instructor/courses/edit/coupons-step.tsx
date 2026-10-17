"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    CalendarIcon,
    CircleOffIcon,
    CopyIcon,
    EllipsisIcon,
    PencilIcon,
    PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { CouponDialog } from "@/components/dashboard/instructor/coupons/coupon-dialog";
import {
    formatCount,
    formatCouponDate,
    formatMoney,
    formatMoneyWhole,
    formatRedemptions,
} from "@/components/dashboard/instructor/coupons/coupons-format";
import {
    EDITOR_CARD,
    EDITOR_HEADING,
    EDITOR_LEAD,
} from "@/components/dashboard/instructor/courses/edit/editor-controls";
import {
    COUPON_PERCENT_OPTIONS,
    courseCouponsCopy,
} from "@/lib/config/course-editor";
import {
    COUPON_CODE_MAX,
    couponStatusBadge,
    couponStatusLabel,
} from "@/lib/config/instructor-coupons";
import {
    createCoupon,
    endCoupon,
    updateCoupon,
    type CouponInput,
} from "@/lib/actions/instructor-coupons";
import type { CouponRow, CourseCoupons } from "@/lib/instructor-coupons";
import { cn } from "@/lib/utils";

function CouponsStep({
    courseId,
    data,
}: {
    courseId: string;
    data: CourseCoupons;
}) {
    const [dialog, setDialog] = React.useState<
        { open: false } | { open: true; coupon: CouponRow | null }
    >({ open: false });
    const [busy, setBusy] = React.useState<
        { kind: "dialog" } | { kind: "end"; id: string } | null
    >(null);
    const [, startTransition] = React.useTransition();
    const router = useRouter();

    const { stats } = data;
    const hasPrice = data.course.listPriceCents > 0;

    function submitDialog(input: CouponInput) {
        const editing = dialog.open ? dialog.coupon : null;
        setBusy({ kind: "dialog" });
        startTransition(async () => {
            const result = editing
                ? await updateCoupon(editing.id, input)
                : await createCoupon(input);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) {
                setDialog({ open: false });
                router.refresh();
            }
            setBusy(null);
        });
    }

    function end(row: CouponRow) {
        setBusy({ kind: "end", id: row.id });
        startTransition(async () => {
            const result = await endCoupon(row.id);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) router.refresh();
            setBusy(null);
        });
    }

    return (
        <Card className={EDITOR_CARD}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className={EDITOR_HEADING}>
                        {courseCouponsCopy.heading}
                    </h2>
                    <p className={cn(EDITOR_LEAD, "max-w-138.75")}>
                        {courseCouponsCopy.lead}
                    </p>
                </div>
                <Button
                    type="button"
                    disabled={!hasPrice}
                    title={hasPrice ? undefined : courseCouponsCopy.needsPrice}
                    onClick={() => setDialog({ open: true, coupon: null })}
                    className="-mt-0.5 h-10 gap-2 px-4 text-[15px]"
                >
                    <PlusIcon className="size-4" />
                    {courseCouponsCopy.newCoupon}
                </Button>
            </div>

            <div className="mt-5.5 grid gap-4 sm:grid-cols-3">
                <StatTile
                    value={formatCount(stats.activeCount)}
                    label={courseCouponsCopy.stats.active}
                />
                <StatTile
                    value={formatCount(stats.redemptions)}
                    label={courseCouponsCopy.stats.redemptions}
                />
                <StatTile
                    value={formatMoneyWhole(stats.revenueCents)}
                    label={courseCouponsCopy.stats.revenue}
                />
            </div>

            {data.rows.length > 0 ? (
                <Table className="mt-5 min-w-200 table-fixed border-b border-border-subtle">
                    <colgroup>
                        <col className="w-[21%]" />
                        <col className="w-[14%]" />
                        <col className="w-[13%]" />
                        <col className="w-[15%]" />
                        <col />
                        <col className="w-11" />
                    </colgroup>
                    <TableHeader>
                        <TableRow className="h-10.5 border-border-subtle hover:bg-transparent">
                            {Object.values(courseCouponsCopy.columns).map(
                                (label) => (
                                    <TableHead
                                        key={label}
                                        className="h-10.5 px-1 text-[15px] font-normal text-muted-foreground"
                                    >
                                        {label}
                                    </TableHead>
                                ),
                            )}
                            <TableHead className="px-1">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.rows.map((row) => (
                            <CouponLine
                                key={row.id}
                                row={row}
                                ending={
                                    busy?.kind === "end" && busy.id === row.id
                                }
                                onEdit={() =>
                                    setDialog({ open: true, coupon: row })
                                }
                                onEnd={() => end(row)}
                            />
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="mt-5 grid h-30 place-items-center rounded-xl border border-dashed px-6 text-center">
                    <div>
                        <p className="text-[15px] font-semibold">
                            {courseCouponsCopy.empty.title}
                        </p>
                        <p className="mt-1 text-[14px] text-muted-foreground">
                            {courseCouponsCopy.empty.description}
                        </p>
                    </div>
                </div>
            )}

            <QuickCreate courseId={courseId} hasPrice={hasPrice} />

            <CouponDialog
                open={dialog.open}
                onOpenChange={(next) =>
                    setDialog(
                        next ? { open: true, coupon: null } : { open: false },
                    )
                }
                courses={[data.course]}
                coupon={dialog.open ? dialog.coupon : null}
                revenueShareBps={data.revenueShareBps}
                pending={busy?.kind === "dialog"}
                onSubmit={submitDialog}
            />
        </Card>
    );
}

function StatTile({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-xl border bg-background px-4.5 py-3.5">
            <p className="text-2xl leading-8 font-bold tabular-nums">{value}</p>
            <p className="text-[15px] leading-5 text-muted-foreground">
                {label}
            </p>
        </div>
    );
}

function CouponLine({
    row,
    ending,
    onEdit,
    onEnd,
}: {
    row: CouponRow;
    ending: boolean;
    onEdit: () => void;
    onEnd: () => void;
}) {
    const copy = courseCouponsCopy;
    const when =
        row.status === "scheduled"
            ? copy.when.scheduled(formatCouponDate(row.startsAt))
            : row.status === "expired" && row.endsAt
              ? copy.when.expired(formatCouponDate(row.endsAt))
              : copy.when.active(
                    row.endsAt ? formatCouponDate(row.endsAt) : null,
                );

    return (
        <TableRow
            className={cn(
                "h-15.25 border-border-subtle hover:bg-transparent",
                ending && "opacity-60",
            )}
        >
            <TableCell className="truncate px-1 text-[16px] font-bold tracking-[0.01em]">
                {row.code}
            </TableCell>
            <TableCell className="px-1 text-[16px] text-muted-foreground tabular-nums">
                {copy.discount(row.percentOff)}
            </TableCell>
            <TableCell className="px-1 text-[16px] font-semibold tabular-nums">
                {formatMoney(row.priceCents)}
            </TableCell>
            <TableCell className="px-1 text-[16px] text-muted-foreground tabular-nums">
                {formatRedemptions(row.redemptions, row.redemptionLimit)}
            </TableCell>
            <TableCell className="px-1">
                <span className="flex min-w-0 items-center gap-3">
                    <span
                        className={cn(
                            "inline-flex h-5.5 shrink-0 items-center rounded-full px-2.5 text-[14px] font-medium",
                            couponStatusBadge[row.status],
                        )}
                    >
                        {couponStatusLabel[row.status]}
                    </span>
                    <span className="truncate text-[15px] text-muted-foreground">
                        {when}
                    </span>
                </span>
            </TableCell>
            <TableCell className="px-1 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label={copy.actions.label(row.code)}
                        className="inline-grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground ring-1 ring-border transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <EllipsisIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={onEdit}
                            className="cursor-pointer p-2"
                        >
                            <PencilIcon />
                            {copy.actions.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                void navigator.clipboard
                                    .writeText(row.code)
                                    .then(() =>
                                        toast.add({
                                            title: copy.actions.copied(
                                                row.code,
                                            ),
                                            type: "success",
                                        }),
                                    )
                                    .catch(() => undefined);
                            }}
                            className="cursor-pointer p-2"
                        >
                            <CopyIcon />
                            {copy.actions.copy}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            disabled={row.status === "expired" || ending}
                            title={
                                row.status === "expired"
                                    ? copy.actions.expired
                                    : undefined
                            }
                            onClick={onEnd}
                            className="cursor-pointer p-2"
                        >
                            <CircleOffIcon />
                            {row.status === "scheduled"
                                ? copy.actions.endScheduled
                                : copy.actions.end}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function QuickCreate({
    courseId,
    hasPrice,
}: {
    courseId: string;
    hasPrice: boolean;
}) {
    const copy = courseCouponsCopy.create;
    const [code, setCode] = React.useState("");
    const [percent, setPercent] = React.useState("30");
    const [limit, setLimit] = React.useState("");
    const [expires, setExpires] = React.useState<Date | null>(null);
    const [dateOpen, setDateOpen] = React.useState(false);
    const [pending, startTransition] = React.useTransition();
    const router = useRouter();

    const [today] = React.useState(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return start;
    });

    function submit() {
        const trimmedLimit = limit.trim();
        const parsedLimit = trimmedLimit === "" ? null : Number(trimmedLimit);
        startTransition(async () => {
            const result = await createCoupon({
                code,
                courseId,
                discountType: "PERCENT",
                percentOff: Number(percent),
                priceCents: 0,
                redemptionLimit: parsedLimit,
                startsAt: null,
                endsAt: expires ? expires.toISOString() : null,
            });
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) {
                setCode("");
                setLimit("");
                setExpires(null);
                router.refresh();
            }
        });
    }

    const fieldClass =
        "mt-1.5 h-10 w-full rounded-lg border bg-card px-3 text-[15px] outline-none transition-shadow placeholder:text-subtle-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";
    const labelClass = "block text-[15px] leading-5 text-muted-foreground";

    return (
        <section
            aria-labelledby="quick-coupon-heading"
            className="mt-6 rounded-xl border bg-background px-5 pt-4 pb-4.5"
        >
            <h3
                id="quick-coupon-heading"
                className="text-base leading-6 font-semibold"
            >
                {copy.heading}
            </h3>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <fieldset
                    disabled={!hasPrice || pending}
                    className="mt-2 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div className="min-w-0">
                        <label
                            htmlFor="quick-coupon-code"
                            className={labelClass}
                        >
                            {copy.code}
                        </label>
                        <input
                            id="quick-coupon-code"
                            value={code}
                            required
                            maxLength={COUPON_CODE_MAX}
                            autoComplete="off"
                            placeholder={copy.codePlaceholder}
                            onChange={(event) =>
                                setCode(
                                    event.target.value
                                        .toUpperCase()
                                        .replace(/\s+/g, ""),
                                )
                            }
                            className={cn(fieldClass, "tracking-[0.01em]")}
                        />
                    </div>

                    <div className="min-w-0">
                        <label
                            id="quick-coupon-discount-label"
                            className={labelClass}
                        >
                            {copy.discount}
                        </label>
                        <Select
                            value={percent}
                            onValueChange={(value) => {
                                if (typeof value === "string")
                                    setPercent(value);
                            }}
                        >
                            <SelectTrigger
                                aria-labelledby="quick-coupon-discount-label"
                                className={cn(
                                    fieldClass,
                                    "justify-between gap-2 pr-3 data-[size=default]:h-10 dark:bg-card dark:hover:bg-card",
                                )}
                            >
                                <SelectValue>
                                    {(current: string) =>
                                        courseCouponsCopy.discount(
                                            Number(current),
                                        )
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {COUPON_PERCENT_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={String(option)}
                                        >
                                            {courseCouponsCopy.discount(option)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-0">
                        <label
                            htmlFor="quick-coupon-limit"
                            className={labelClass}
                        >
                            {copy.limit}
                        </label>
                        <input
                            id="quick-coupon-limit"
                            value={limit}
                            inputMode="numeric"
                            placeholder={copy.limitPlaceholder}
                            onChange={(event) =>
                                setLimit(
                                    event.target.value.replace(/[^0-9]/g, ""),
                                )
                            }
                            className={fieldClass}
                        />
                    </div>

                    <div className="min-w-0">
                        <label
                            htmlFor="quick-coupon-expires"
                            className={labelClass}
                        >
                            {copy.expires}
                        </label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger
                                render={
                                    <button
                                        id="quick-coupon-expires"
                                        type="button"
                                        className={cn(
                                            fieldClass,
                                            "flex cursor-pointer items-center justify-between gap-2 text-left",
                                            !expires &&
                                                "text-subtle-foreground",
                                        )}
                                    />
                                }
                            >
                                {expires
                                    ? formatCouponDate(expires)
                                    : copy.expiresPlaceholder}
                                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                className="w-auto p-0"
                            >
                                <Calendar
                                    mode="single"
                                    selected={expires ?? undefined}
                                    disabled={{ before: today }}
                                    onSelect={(date) => {
                                        setExpires(date ?? null);
                                        setDateOpen(false);
                                    }}
                                    autoFocus
                                />
                                {expires ? (
                                    <div className="border-t border-border p-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 w-full text-[13px]"
                                            onClick={() => {
                                                setExpires(null);
                                                setDateOpen(false);
                                            }}
                                        >
                                            {copy.clearDate}
                                        </Button>
                                    </div>
                                ) : null}
                            </PopoverContent>
                        </Popover>
                    </div>
                </fieldset>

                {hasPrice ? null : (
                    <p className="mt-3 text-[14px] text-muted-foreground">
                        {courseCouponsCopy.needsPrice}
                    </p>
                )}

                <Button
                    type="submit"
                    loading={pending}
                    disabled={!hasPrice}
                    className="mt-4 h-10 px-5 text-[15px]"
                >
                    {copy.submit}
                </Button>
            </form>
        </section>
    );
}

export { CouponsStep };
