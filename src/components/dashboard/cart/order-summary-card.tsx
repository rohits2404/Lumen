import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartSummary } from "@/lib/cart";

function OrderSummaryCard({ summary }: { summary: CartSummary }) {
    const rows = [
        { label: "Subtotal", value: summary.subtotal },
        { label: "Discount", value: summary.discount },
    ];

    return (
        <Card className="gap-0 px-5.5 py-5 ring-border">
            <h3 className="text-base">Order Summary</h3>

            <dl className="mt-3 flex flex-col gap-1.25">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-baseline justify-between"
                    >
                        <dt className="text-sm text-muted-foreground">
                            {row.label}
                        </dt>
                        <dd className="text-sm tabular-nums">
                            ${row.value.toFixed(2)}
                        </dd>
                    </div>
                ))}
            </dl>

            <Separator className="my-3" />

            <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold tabular-nums">
                    ${summary.total.toFixed(2)}
                </span>
            </div>

            <Button
                nativeButton={false}
                disabled={summary.lines.length === 0}
                className="mt-4 h-11 w-full text-sm font-semibold shadow-sm"
                render={<Link href="/checkout" />}
            >
                Proceed To Checkout
            </Button>

            <Link
                href="/dashboard/courses"
                className="mt-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                Continue Browsing
            </Link>
        </Card>
    );
}

export { OrderSummaryCard };
