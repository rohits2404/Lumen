import type { PayoutMethodView } from "@/lib/instructor-payouts";

export function formatMoney(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
}

export function ordinal(day: number): string {
    const rem100 = day % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
    switch (day % 10) {
        case 1:
            return `${day}st`;
        case 2:
            return `${day}nd`;
        case 3:
            return `${day}rd`;
        default:
            return `${day}th`;
    }
}

export function methodTitle(method: PayoutMethodView): string {
    if (method.type === "PAYPAL") return `PayPal · ${method.label}`;
    return method.last4
        ? `Bank transfer · ••••${method.last4}`
        : "Bank transfer";
}

export function methodDescription(method: PayoutMethodView): string {
    const role =
        method.role === "PRIMARY" ? "primary destination" : "used as fallback";

    if (method.type === "PAYPAL") {
        return [method.verified ? "Verified" : "Not verified", role].join(
            " · ",
        );
    }

    return [
        method.label,
        method.currency.toUpperCase(),
        `added ${method.addedOn}`,
    ].join(" · ");
}
