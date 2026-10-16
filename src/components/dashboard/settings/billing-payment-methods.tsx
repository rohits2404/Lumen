import { Badge } from "@/components/ui/badge";
import { AddPaymentMethodRow } from "@/components/dashboard/settings/add-payment-method-dialog";
import { CardRowMenu } from "@/components/dashboard/settings/billing-actions";
import type { BillingCard } from "@/lib/billing";

function brandLabel(brand: string) {
    if (brand === "amex") return "Amex";
    if (brand === "unionpay") return "UnionPay";
    return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function expiryLabel(month: number, year: number) {
    const date = new Date(Date.UTC(year, month - 1, 1));
    return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

function BillingPaymentMethods({
    cards,
    configured,
}: {
    cards: BillingCard[];
    configured: boolean;
}) {
    return (
        <section>
            <h2 className="text-[17px] leading-snug font-bold">
                Payment Method
            </h2>

            <div className="mt-3.5 flex flex-col gap-3">
                {cards.map((card) => {
                    const label = card.name ?? brandLabel(card.brand);
                    return (
                        <div
                            key={card.id}
                            className="flex min-h-19.75 items-center justify-between gap-4 rounded-lg border border-border px-5.5 py-4"
                        >
                            <div className="flex min-w-0 flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="truncate text-[15px] font-semibold">
                                        {label} •••• {card.last4}
                                    </span>
                                    {card.isDefault ? (
                                        <Badge
                                            variant="outline"
                                            className="shrink-0 border-info px-3 text-info"
                                        >
                                            Primary
                                        </Badge>
                                    ) : null}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Expires{" "}
                                    {expiryLabel(card.expMonth, card.expYear)}
                                </span>
                            </div>
                            <CardRowMenu
                                paymentMethodId={card.id}
                                label={`${label} Ending ${card.last4}`}
                                isDefault={card.isDefault}
                            />
                        </div>
                    );
                })}

                <AddPaymentMethodRow disabled={!configured} />
            </div>
        </section>
    );
}

export { BillingPaymentMethods };
