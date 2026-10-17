const count = new Intl.NumberFormat("en-US");

export function formatCount(value: number): string {
    return count.format(value);
}

const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

export function formatMoneyWhole(cents: number): string {
    return money.format(Math.round(cents / 100));
}

export function formatRating(rating: number): string {
    return rating.toFixed(1);
}
