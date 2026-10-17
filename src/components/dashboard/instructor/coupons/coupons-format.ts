import { format } from "date-fns";

export function formatMoneyWhole(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(cents / 100);
}

export function formatMoney(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export function formatCount(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

export function formatCouponDate(date: Date) {
    return format(date, "dd MMM yyyy");
}

export function couponSchedule(
    startsAt: Date,
    endsAt: Date | null,
    now: Date,
): string | null {
    if (startsAt > now) return `Starts ${formatCouponDate(startsAt)}`;
    if (endsAt) return `Ends ${formatCouponDate(endsAt)}`;
    return null;
}

export function formatRedemptions(used: number, limit: number | null) {
    return limit === null
        ? formatCount(used)
        : `${formatCount(used)} / ${formatCount(limit)}`;
}

export function redemptionFraction(used: number, limit: number | null) {
    if (!limit || limit <= 0) return 0;
    return Math.min(1, used / limit);
}

export function toDateInput(date: Date | null) {
    return date ? format(date, "yyyy-MM-dd") : "";
}
