export type StatFormat =
    "count" | "currency" | "money" | "percent" | "percent1";

const counts = new Intl.NumberFormat("en-US");

const compactCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
});

const percent1 = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
});

const moneyWhole = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});
const moneyCents = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

export function formatMoney(cents: number): string {
    return cents % 100 === 0
        ? moneyWhole.format(cents / 100)
        : moneyCents.format(cents / 100);
}

const NO_VALUE = "—";

export function formatStatValue(value: number | null, as: StatFormat): string {
    if (value === null) return NO_VALUE;
    switch (as) {
        case "currency":
            return compactCurrency.format(value / 100);
        case "percent":
            return `${(value * 100).toFixed(2)}%`;
        case "money":
            return formatMoney(value);
        case "percent1":
            return percent1.format(value);
        default:
            return counts.format(value);
    }
}

export function formatDelta(delta: number | null): string | null {
    if (delta === null) return null;
    const sign = delta < 0 ? "−" : "+";
    return `${sign}${Math.abs(delta * 100).toFixed(1)}%`;
}

export function formatCountDelta(delta: number | null): string | null {
    if (delta === null) return null;
    const sign = delta < 0 ? "−" : "+";
    return `${sign}${Math.abs(delta)}`;
}

export function deltaToneClass(delta: number | null): string {
    if (delta === null || delta === 0) return "text-muted-foreground";
    return delta > 0 ? "text-success" : "text-destructive";
}
