export { formatMoney } from "@/components/dashboard/stat-format";

const exact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const compact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
});

export function formatMoneyExact(cents: number): string {
    return exact.format(cents / 100);
}

export function formatMoneyCompact(cents: number): string {
    return compact.format(cents / 100).replace(/K$/, "k");
}
