"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    EDITOR_CARD,
    EDITOR_HEADING,
    EDITOR_LABEL,
    EDITOR_LEAD,
    EDITOR_SELECT,
    EDITOR_SUBMIT,
    EDITOR_SWITCH,
} from "./editor-controls";
import {
    COURSE_CURRENCIES,
    formatPrice,
    PRICE_TIERS_CENTS,
    pricingCopy,
} from "@/lib/config/course-editor";
import type { EditorPricing } from "@/lib/instructor-course-edit";
import { cn } from "@/lib/utils";

export type PricingValues = {
    currency: string;
    listPriceCents: number;
    includedInBusiness: boolean;
};

function PricingForm({
    courseId,
    pricing,
    values,
    onChange,
    onSubmit,
    pending,
}: {
    courseId: string;
    pricing: EditorPricing;
    values: PricingValues;
    onChange: (next: Partial<PricingValues>) => void;
    onSubmit: () => void;
    pending: boolean;
}) {
    const tiers: number[] = (PRICE_TIERS_CENTS as readonly number[]).includes(
        pricing.listPriceCents,
    )
        ? [...PRICE_TIERS_CENTS]
        : pricing.listPriceCents > 0
          ? [pricing.listPriceCents, ...PRICE_TIERS_CENTS]
          : [...PRICE_TIERS_CENTS];

    return (
        <Card className={EDITOR_CARD}>
            <h2 className={EDITOR_HEADING}>{pricingCopy.heading}</h2>
            <p className={EDITOR_LEAD}>{pricingCopy.lead}</p>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit();
                }}
            >
                <div className="mt-5.5 grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                        <label
                            id="pricing-currency-label"
                            className={EDITOR_LABEL}
                        >
                            {pricingCopy.currency.label}
                        </label>
                        <Select
                            value={values.currency}
                            disabled={pending}
                            onValueChange={(value) => {
                                if (typeof value === "string")
                                    onChange({ currency: value });
                            }}
                        >
                            <SelectTrigger
                                aria-labelledby="pricing-currency-label"
                                className={cn(EDITOR_SELECT, "mt-1.5")}
                            >
                                <SelectValue>
                                    {(current: string) =>
                                        COURSE_CURRENCIES.find(
                                            (row) => row.value === current,
                                        )?.label ?? current
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {COURSE_CURRENCIES.map((currency) => (
                                        <SelectItem
                                            key={currency.value}
                                            value={currency.value}
                                        >
                                            {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="min-w-0">
                        <label
                            id="pricing-list-price-label"
                            className={EDITOR_LABEL}
                        >
                            {pricingCopy.listPrice.label}
                        </label>
                        <Select
                            value={
                                values.listPriceCents > 0
                                    ? String(values.listPriceCents)
                                    : null
                            }
                            disabled={pending}
                            onValueChange={(value) => {
                                if (typeof value === "string") {
                                    onChange({ listPriceCents: Number(value) });
                                }
                            }}
                        >
                            <SelectTrigger
                                aria-labelledby="pricing-list-price-label"
                                className={cn(EDITOR_SELECT, "mt-1.5")}
                            >
                                <SelectValue
                                    placeholder={
                                        pricingCopy.listPrice.placeholder
                                    }
                                >
                                    {(current: string | null) =>
                                        current
                                            ? formatPrice(Number(current))
                                            : pricingCopy.listPrice.placeholder
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {tiers.map((cents) => (
                                        <SelectItem
                                            key={cents}
                                            value={String(cents)}
                                        >
                                            {formatPrice(cents)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4.5 flex items-center justify-between gap-4 rounded-xl border px-5 py-4">
                    <div className="min-w-0">
                        <label
                            htmlFor="pricing-business"
                            className="block cursor-pointer text-base leading-6 font-semibold"
                        >
                            {pricingCopy.business.title}
                        </label>
                        <p className="mt-0.5 text-[13px] leading-4.5 text-muted-foreground">
                            {pricingCopy.business.description}
                        </p>
                    </div>
                    <Switch
                        id="pricing-business"
                        checked={values.includedInBusiness}
                        disabled={pending}
                        onCheckedChange={(checked) =>
                            onChange({ includedInBusiness: checked })
                        }
                        className={EDITOR_SWITCH}
                    />
                </div>

                <section
                    aria-labelledby="pricing-promotion-heading"
                    className="mt-6 rounded-xl border bg-background px-5 pt-4 pb-4"
                >
                    <h3
                        id="pricing-promotion-heading"
                        className="text-base leading-6 font-semibold"
                    >
                        {pricingCopy.promotion.heading}
                    </h3>

                    {pricing.promotions.length > 0 ? (
                        <ul className="mt-2 flex flex-col gap-2">
                            {pricing.promotions.map((promotion) => (
                                <li
                                    key={promotion.id}
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1"
                                >
                                    <span className="inline-flex h-6 items-center rounded-md bg-success/10 px-3 text-[14px] font-semibold text-success">
                                        {promotion.code} ·{" "}
                                        {pricingCopy.promotion.discount(
                                            promotion.percentOff,
                                        )}
                                    </span>
                                    <span className="text-[14px] text-muted-foreground">
                                        {[
                                            promotion.schedule,
                                            pricingCopy.promotion.redemptions(
                                                promotion.redemptions,
                                            ),
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                            {pricingCopy.promotion.none}
                        </p>
                    )}

                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                            <Link
                                href={`/dashboard/instructor/coupons?course=${encodeURIComponent(courseId)}`}
                            />
                        }
                        className="mt-4 h-10 bg-card px-4 text-[15px] shadow-sm"
                    >
                        {pricingCopy.promotion.manage}
                    </Button>
                </section>

                <Button
                    type="submit"
                    loading={pending}
                    className={cn(EDITOR_SUBMIT, "mt-5.5")}
                >
                    {pricingCopy.save}
                </Button>
            </form>
        </Card>
    );
}

export { PricingForm };
