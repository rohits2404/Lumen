import type {
    PromotionDiscountType,
    PromotionScope,
} from "@/generated/prisma/client";

const counts = new Intl.NumberFormat("en-US");

export function formatCount(value: number) {
    return counts.format(value);
}

export function compactMoney(cents: number) {
    const dollars = Math.round(cents / 100);
    if (dollars >= 1_000_000) {
        return `$${(dollars / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}k`;
    return `$${counts.format(dollars)}`;
}

export function discountLabel(
    discountType: PromotionDiscountType,
    value: number,
) {
    if (discountType === "PERCENT") return `${value}% Off`;
    return `$${(value / 100).toFixed(2)} Flat`;
}

export function scopeLabel(scope: PromotionScope, categoryNames: string[]) {
    if (scope === "ALL_COURSES" || categoryNames.length === 0) {
        return "All Categories";
    }
    if (categoryNames.length <= 2) return categoryNames.join(" · ");
    return `${categoryNames.slice(0, 2).join(" · ")}+${
        categoryNames.length - 2
    } more`;
}

export function formatPromotionDay(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

export function toDayValue(date: Date) {
    return date.toISOString().slice(0, 10);
}
