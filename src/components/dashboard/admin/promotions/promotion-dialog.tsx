"use client";

import * as React from "react";
import { CalendarIcon, CheckIcon, RocketIcon } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    discountTypeOptions,
    promotionDialogCopy,
    promotionScopeOptions,
    PROMOTION_NAME_MAX_LENGTH,
} from "@/lib/config/admin-promotions";
import type { PromotionInput } from "@/lib/actions/admin-promotions";
import type { PromotionCategory } from "@/lib/admin/promotions";
import type {
    PromotionDiscountType,
    PromotionScope,
} from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type PromotionDialogValues = {
    name: string;
    discountType: PromotionDiscountType;
    value: number;
    scope: PromotionScope;
    categoryIds: string[];
    startsOn: string | null;
    endsOn: string;
    forceOnAllCourses: boolean;
};

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function dayLabel(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return value;
    return `${match[3]} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

function parseDay(value: string | null): Date | undefined {
    const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
    if (!match) return undefined;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toDay(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function defaultEndsOn() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return toDay(date);
}

const FIELD = cn(
    "h-11 rounded-lg border-border bg-background px-3.5 text-[15px] md:text-[15px]",
    "placeholder:text-muted-foreground dark:bg-background",
);

const LABEL = "text-[15px] font-semibold";

const SWITCH = cn(
    "border-0 p-[3px] data-[size=default]:h-6.5 data-[size=default]:w-11.5",
    "data-unchecked:bg-track dark:data-unchecked:bg-track",
    "[&_[data-slot=switch-thumb]]:size-5",
    "[&_[data-slot=switch-thumb]]:data-checked:translate-x-full",
);

function PromotionDialog({
    open,
    onOpenChange,
    mode,
    targetId,
    values,
    categories,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    targetId?: string;
    values: PromotionDialogValues | null;
    categories: PromotionCategory[];
    pending: boolean;
    onSubmit: (input: PromotionInput) => void;
}) {
    const copy = promotionDialogCopy;

    const [name, setName] = React.useState("");
    const [discountType, setDiscountType] =
        React.useState<PromotionDiscountType>("PERCENT");
    const [amount, setAmount] = React.useState("");
    const [scope, setScope] = React.useState<PromotionScope>("ALL_COURSES");
    const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
    const [startsOn, setStartsOn] = React.useState<string | null>(null);
    const [endsOn, setEndsOn] = React.useState("");
    const [force, setForce] = React.useState(false);
    const [startOpen, setStartOpen] = React.useState(false);
    const [endOpen, setEndOpen] = React.useState(false);

    const formKey = open
        ? mode === "edit"
            ? `edit:${targetId}`
            : "create"
        : null;
    const [seededKey, setSeededKey] = React.useState<string | null>(null);
    if (formKey !== seededKey) {
        setSeededKey(formKey);
        if (formKey) {
            setName(values?.name ?? "");
            setDiscountType(values?.discountType ?? "PERCENT");
            setAmount(
                values
                    ? values.discountType === "PERCENT"
                        ? String(values.value)
                        : (values.value / 100).toFixed(2)
                    : "",
            );
            setScope(values?.scope ?? "ALL_COURSES");
            setCategoryIds(values?.categoryIds ?? []);
            setStartsOn(values?.startsOn ?? null);
            setEndsOn(values?.endsOn ?? defaultEndsOn());
            setForce(values?.forceOnAllCourses ?? false);
            setStartOpen(false);
            setEndOpen(false);
        }
    }

    const endsFloor = React.useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = parseDay(startsOn);
        return start && start > today ? start : today;
    }, [startsOn]);

    const percent = discountType === "PERCENT";
    const trimmed = name.trim();
    const amountValue = Number(amount);
    const amountValid =
        amount.trim().length > 0 && Number.isFinite(amountValue);
    const scopeValid = scope === "ALL_COURSES" || categoryIds.length > 0;
    const ready =
        trimmed.length > 0 && amountValid && scopeValid && endsOn !== "";

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!ready || pending) return;
        onSubmit({
            name: trimmed,
            discountType,
            value: percent
                ? Math.round(amountValue)
                : Math.round(amountValue * 100),
            scope,
            categoryIds: scope === "CATEGORIES" ? categoryIds : [],
            startsOn,
            endsOn,
            forceOnAllCourses: force,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[88vh] w-140 flex-col gap-0 p-0 sm:max-w-140">
                <DialogHeader className="gap-2 px-7.5 pt-7.5">
                    <DialogTitle className="text-xl font-bold">
                        {mode === "create" ? copy.createTitle : copy.editTitle}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {copy.description}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7.5 pt-5 pb-7.5"
                >
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="promotion-name" className={LABEL}>
                                {copy.nameLabel}
                            </label>
                            <Input
                                id="promotion-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                maxLength={PROMOTION_NAME_MAX_LENGTH}
                                placeholder={copy.namePlaceholder}
                                autoComplete="off"
                                className={FIELD}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className={LABEL}>{copy.discountTypeLabel}</p>
                            <div
                                role="radiogroup"
                                aria-label={copy.discountTypeLabel}
                                className="flex flex-col gap-2.5"
                            >
                                {discountTypeOptions.map((option) => {
                                    const selected =
                                        option.value === discountType;
                                    return (
                                        <label
                                            key={option.value}
                                            className={cn(
                                                "flex cursor-pointer items-center gap-4 rounded-xl border-2 px-4 py-3.5 transition-colors",
                                                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                                selected
                                                    ? "border-foreground bg-hover"
                                                    : "border-border bg-background",
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="promotion-discount-type"
                                                value={option.value}
                                                checked={selected}
                                                onChange={() =>
                                                    setDiscountType(
                                                        option.value,
                                                    )
                                                }
                                                className="sr-only"
                                            />
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    "grid size-4.5 shrink-0 place-items-center rounded-full border-[1.5px]",
                                                    selected
                                                        ? "border-foreground"
                                                        : "border-border",
                                                )}
                                            >
                                                {selected ? (
                                                    <span className="size-2.25 rounded-full bg-foreground" />
                                                ) : null}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-[15px] leading-5 font-semibold">
                                                    {option.label}
                                                </span>
                                                <span className="block text-[13px] leading-4.5 text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="promotion-amount" className={LABEL}>
                                {percent ? copy.percentLabel : copy.fixedLabel}
                            </label>
                            <div className="relative">
                                {percent ? null : (
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] text-muted-foreground"
                                    >
                                        {copy.fixedPrefix}
                                    </span>
                                )}
                                <Input
                                    id="promotion-amount"
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value.replace(
                                                /[^\d.]/g,
                                                "",
                                            ),
                                        )
                                    }
                                    maxLength={percent ? 2 : 8}
                                    placeholder={
                                        percent
                                            ? copy.percentPlaceholder
                                            : copy.fixedPlaceholder
                                    }
                                    autoComplete="off"
                                    className={cn(
                                        FIELD,
                                        percent ? undefined : "pl-8",
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className={LABEL}>{copy.applyToLabel}</p>
                            <ToggleGroup
                                value={[scope]}
                                onValueChange={(next: string[]) => {
                                    setScope(
                                        (current) =>
                                            (next[0] as
                                                PromotionScope | undefined) ??
                                            current,
                                    );
                                }}
                                aria-label={copy.applyToLabel}
                                className="w-fit gap-0 rounded-xl bg-track p-1"
                            >
                                {promotionScopeOptions.map((option) => (
                                    <ToggleGroupItem
                                        key={option.value}
                                        value={option.value}
                                        size="lg"
                                        className="h-8 rounded-lg px-4 text-[15px] text-muted-foreground aria-pressed:bg-card aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:shadow-sm aria-pressed:hover:bg-card"
                                    >
                                        {option.label}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        {scope === "CATEGORIES" ? (
                            <div className="flex flex-col gap-2">
                                <p className={LABEL}>{copy.categoriesLabel}</p>
                                {categories.length === 0 ? (
                                    <p className="text-[13px] text-muted-foreground">
                                        {copy.categoriesEmpty}
                                    </p>
                                ) : (
                                    <div
                                        role="group"
                                        aria-label={copy.categoriesLabel}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {categories.map((category) => {
                                            const checked =
                                                categoryIds.includes(
                                                    category.id,
                                                );
                                            return (
                                                <label
                                                    key={category.id}
                                                    className={cn(
                                                        "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-[15px] transition-colors",
                                                        "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                                        checked
                                                            ? "border-foreground bg-hover font-semibold"
                                                            : "border-border bg-background text-muted-foreground",
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            setCategoryIds(
                                                                (current) =>
                                                                    current.includes(
                                                                        category.id,
                                                                    )
                                                                        ? current.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  category.id,
                                                                          )
                                                                        : [
                                                                              ...current,
                                                                              category.id,
                                                                          ],
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />
                                                    {checked ? (
                                                        <CheckIcon
                                                            aria-hidden
                                                            className="size-4"
                                                        />
                                                    ) : null}
                                                    {category.name}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <div className="grid gap-3.5 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="promotion-starts"
                                    className={LABEL}
                                >
                                    {copy.startsLabel}
                                </label>
                                <Popover
                                    open={startOpen}
                                    onOpenChange={setStartOpen}
                                >
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                id="promotion-starts"
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    FIELD,
                                                    "w-full justify-between gap-2 pr-3.5 font-normal hover:bg-background aria-expanded:bg-background",
                                                    !startsOn &&
                                                        "text-muted-foreground",
                                                )}
                                            />
                                        }
                                    >
                                        {startsOn
                                            ? dayLabel(startsOn)
                                            : copy.startsPlaceholder}
                                        <CalendarIcon className="text-muted-foreground" />
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-auto p-0"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={parseDay(startsOn)}
                                            onSelect={(date) => {
                                                setStartsOn(
                                                    date ? toDay(date) : null,
                                                );
                                                setStartOpen(false);
                                            }}
                                            disabled={{ before: new Date() }}
                                            defaultMonth={
                                                parseDay(startsOn) ?? new Date()
                                            }
                                            autoFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="promotion-ends"
                                    className={LABEL}
                                >
                                    {copy.endsLabel}
                                </label>
                                <Popover
                                    open={endOpen}
                                    onOpenChange={setEndOpen}
                                >
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                id="promotion-ends"
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    FIELD,
                                                    "w-full justify-between gap-2 pr-3.5 font-normal hover:bg-background aria-expanded:bg-background",
                                                    !endsOn &&
                                                        "text-muted-foreground",
                                                )}
                                            />
                                        }
                                    >
                                        {endsOn
                                            ? dayLabel(endsOn)
                                            : copy.endsPlaceholder}
                                        <CalendarIcon className="text-muted-foreground" />
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-auto p-0"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={parseDay(endsOn)}
                                            onSelect={(date) => {
                                                if (!date) return;
                                                setEndsOn(toDay(date));
                                                setEndOpen(false);
                                            }}
                                            disabled={{ before: endsFloor }}
                                            defaultMonth={
                                                parseDay(endsOn) ?? new Date()
                                            }
                                            autoFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5">
                            <div>
                                <Label
                                    htmlFor="promotion-force"
                                    className="cursor-pointer text-[15px] leading-5 font-semibold"
                                >
                                    {copy.forceTitle}
                                </Label>
                                <p className="text-[13px] leading-4.5 text-muted-foreground">
                                    {copy.forceDescription}
                                </p>
                            </div>
                            <Switch
                                id="promotion-force"
                                checked={force}
                                onCheckedChange={setForce}
                                className={SWITCH}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            type="submit"
                            loading={pending}
                            disabled={!ready}
                            className="h-10 gap-2 px-5"
                        >
                            {mode === "create" ? (
                                <RocketIcon className="size-4" />
                            ) : null}
                            {mode === "create"
                                ? copy.createSubmit
                                : copy.editSubmit}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export { PromotionDialog };
