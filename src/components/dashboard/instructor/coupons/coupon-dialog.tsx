"use client";

import * as React from "react";
import { CalendarIcon, InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCouponDate, formatMoney } from "./coupons-format";
import {
    COUPON_CODE_MAX,
    couponDialogCopy,
    discountTypes,
} from "@/lib/config/instructor-coupons";
import type { CouponInput } from "@/lib/actions/instructor-coupons";
import type { CouponCourse, CouponRow } from "@/lib/instructor-coupons";
import { cn } from "@/lib/utils";

const FIELD =
    "h-11 rounded-lg bg-background text-[15px] md:text-[15px] dark:bg-background";
const LABEL = "text-[14px] font-medium text-foreground";

function blank(courseId: string): CouponInput {
    return {
        code: "",
        courseId,
        discountType: "PERCENT",
        percentOff: 40,
        priceCents: 0,
        redemptionLimit: null,
        startsAt: null,
        endsAt: null,
    };
}

function CouponDialog({
    open,
    onOpenChange,
    courses,
    coupon,
    revenueShareBps,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (next: boolean) => void;
    courses: CouponCourse[];
    coupon: CouponRow | null;
    revenueShareBps: number;
    pending: boolean;
    onSubmit: (input: CouponInput) => void;
}) {
    const [values, setValues] = React.useState<CouponInput>(() =>
        blank(courses[0]?.id ?? ""),
    );
    const [startsOpen, setStartsOpen] = React.useState(false);
    const [endsOpen, setEndsOpen] = React.useState(false);

    const seedKey = `${open}:${coupon?.id ?? "new"}`;
    const [lastSeed, setLastSeed] = React.useState(seedKey);
    if (seedKey !== lastSeed) {
        setLastSeed(seedKey);
        if (open) {
            setValues(
                coupon
                    ? {
                          code: coupon.code,
                          courseId: coupon.courseId,
                          discountType: coupon.discountType,
                          percentOff: coupon.percentOff,
                          priceCents: coupon.priceCents,
                          redemptionLimit: coupon.redemptionLimit,
                          startsAt: coupon.startsAt.toISOString(),
                          endsAt: coupon.endsAt
                              ? coupon.endsAt.toISOString()
                              : null,
                      }
                    : blank(courses[0]?.id ?? ""),
            );
        }
    }

    const course = courses.find((entry) => entry.id === values.courseId);
    const percent =
        values.discountType === "PERCENT" ? values.percentOff : null;
    const listPrice = course?.listPriceCents ?? 0;
    const discounted =
        values.discountType === "FIXED_PRICE"
            ? values.priceCents
            : Math.round((listPrice * (100 - (percent ?? 0))) / 100);
    const sane =
        listPrice > 0 && discounted >= 0 && discounted < listPrice && course;
    const payout = Math.round((discounted * revenueShareBps) / 10000);

    const startsAt = values.startsAt ? new Date(values.startsAt) : null;
    const endsAt = values.endsAt ? new Date(values.endsAt) : null;

    function set<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-7.5 sm:max-w-135">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-[20px] font-bold">
                        {coupon
                            ? couponDialogCopy.editTitle
                            : couponDialogCopy.createTitle}
                    </DialogTitle>
                    <DialogDescription className="text-[14px] leading-6">
                        {couponDialogCopy.description}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="mt-5 grid gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(values);
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="coupon-code" className={LABEL}>
                            {couponDialogCopy.code}
                        </Label>
                        <Input
                            id="coupon-code"
                            value={values.code}
                            maxLength={COUPON_CODE_MAX}
                            autoCapitalize="characters"
                            placeholder={couponDialogCopy.codePlaceholder}
                            onChange={(event) =>
                                set("code", event.target.value)
                            }
                            className={cn(FIELD, "uppercase")}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="coupon-course" className={LABEL}>
                            {couponDialogCopy.appliesTo}
                        </Label>
                        <Select
                            value={values.courseId}
                            onValueChange={(next: string | null) =>
                                set("courseId", next ?? "")
                            }
                        >
                            <SelectTrigger
                                id="coupon-course"
                                className={cn(
                                    FIELD,
                                    "w-full data-[size=default]:h-11 dark:bg-background",
                                )}
                            >
                                <SelectValue
                                    placeholder={
                                        couponDialogCopy.appliesToPlaceholder
                                    }
                                >
                                    {(current: string) =>
                                        courses.find(
                                            (entry) => entry.id === current,
                                        )?.title ??
                                        couponDialogCopy.appliesToPlaceholder
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((entry) => (
                                    <SelectItem key={entry.id} value={entry.id}>
                                        {entry.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <span className={LABEL}>
                            {couponDialogCopy.discountType}
                        </span>
                        <div className="grid gap-2.5">
                            {discountTypes.map((entry) => {
                                const selected =
                                    values.discountType === entry.value;
                                return (
                                    <label
                                        key={entry.value}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-3.5 rounded-lg border px-4 py-3.5 transition-colors",
                                            selected
                                                ? "border-2 border-foreground bg-hover px-3.75 py-3.25"
                                                : "border-border bg-background hover:bg-hover/50",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="discount-type"
                                            className="sr-only"
                                            checked={selected}
                                            onChange={() =>
                                                set("discountType", entry.value)
                                            }
                                        />
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "grid size-4.5 shrink-0 place-items-center rounded-full border-2",
                                                selected
                                                    ? "border-foreground"
                                                    : "border-border bg-card",
                                            )}
                                        >
                                            {selected ? (
                                                <span className="size-2 rounded-full bg-foreground" />
                                            ) : null}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-[16px] font-semibold">
                                                {entry.title}
                                            </span>
                                            <span className="block text-[13px] text-muted-foreground">
                                                {entry.description}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="grid gap-2">
                            <Label htmlFor="coupon-amount" className={LABEL}>
                                {values.discountType === "PERCENT"
                                    ? couponDialogCopy.percentOff
                                    : couponDialogCopy.fixedPrice}
                            </Label>
                            <Input
                                id="coupon-amount"
                                inputMode="decimal"
                                value={
                                    values.discountType === "PERCENT"
                                        ? String(values.percentOff)
                                        : values.priceCents === 0
                                          ? ""
                                          : (values.priceCents / 100).toString()
                                }
                                onChange={(event) => {
                                    const raw = Number(
                                        event.target.value.replace(
                                            /[^0-9.]/g,
                                            "",
                                        ),
                                    );
                                    if (values.discountType === "PERCENT") {
                                        set(
                                            "percentOff",
                                            Number.isFinite(raw) ? raw : 0,
                                        );
                                    } else {
                                        set(
                                            "priceCents",
                                            Number.isFinite(raw)
                                                ? Math.round(raw * 100)
                                                : 0,
                                        );
                                    }
                                }}
                                className={FIELD}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="coupon-limit" className={LABEL}>
                                {couponDialogCopy.redemptionLimit}
                            </Label>
                            <Input
                                id="coupon-limit"
                                inputMode="numeric"
                                value={
                                    values.redemptionLimit === null
                                        ? ""
                                        : String(values.redemptionLimit)
                                }
                                placeholder={
                                    couponDialogCopy.redemptionLimitPlaceholder
                                }
                                onChange={(event) => {
                                    const digits = event.target.value.replace(
                                        /[^0-9]/g,
                                        "",
                                    );
                                    set(
                                        "redemptionLimit",
                                        digits === "" ? null : Number(digits),
                                    );
                                }}
                                className={FIELD}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <DateField
                            id="coupon-starts"
                            label={couponDialogCopy.starts}
                            placeholder={couponDialogCopy.startsPlaceholder}
                            value={startsAt}
                            open={startsOpen}
                            onOpenChange={setStartsOpen}
                            onSelect={(date) => {
                                set(
                                    "startsAt",
                                    date ? date.toISOString() : null,
                                );
                                setStartsOpen(false);
                            }}
                        />
                        <DateField
                            id="coupon-expires"
                            label={couponDialogCopy.expires}
                            placeholder={couponDialogCopy.expiresPlaceholder}
                            value={endsAt}
                            open={endsOpen}
                            onOpenChange={setEndsOpen}
                            onSelect={(date) => {
                                set("endsAt", date ? date.toISOString() : null);
                                setEndsOpen(false);
                            }}
                        />
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3.5">
                        <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <p className="text-[13px] leading-6 text-muted-foreground">
                            {sane
                                ? couponDialogCopy.earningsNote(
                                      formatMoney(discounted),
                                      formatMoney(payout),
                                      formatMoney(listPrice),
                                  )
                                : couponDialogCopy.earningsNotePending}
                        </p>
                    </div>

                    <Button
                        type="submit"
                        loading={pending}
                        className="mt-1 h-10 w-fit px-5"
                    >
                        {coupon
                            ? couponDialogCopy.save
                            : couponDialogCopy.create}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DateField({
    id,
    label,
    placeholder,
    value,
    open,
    onOpenChange,
    onSelect,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: Date | null;
    open: boolean;
    onOpenChange: (next: boolean) => void;
    onSelect: (date: Date | undefined) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className={LABEL}>
                {label}
            </Label>
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger
                    render={
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            className={cn(
                                FIELD,
                                "w-full justify-between gap-2 border-border px-3.5 font-normal hover:bg-background aria-expanded:bg-background",
                                !value && "text-muted-foreground",
                            )}
                        />
                    }
                >
                    {value ? formatCouponDate(value) : placeholder}
                    <CalendarIcon className="size-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={value ?? undefined}
                        onSelect={onSelect}
                        autoFocus
                    />
                    {value ? (
                        <div className="border-t border-border p-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-full text-[13px]"
                                onClick={() => onSelect(undefined)}
                            >
                                Clear
                            </Button>
                        </div>
                    ) : null}
                </PopoverContent>
            </Popover>
        </div>
    );
}

export { CouponDialog };
