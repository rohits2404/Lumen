import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { CartSummary } from "@/lib/cart";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { CartItemCard } from "./cart-item-card";
import { OrderSummaryCard } from "./order-summary-card";

function Cart({ summary }: { summary: CartSummary }) {
    const count = summary.lines.length;

    return (
        <div className="mx-auto w-full max-w-230">
            <h1 className="text-[26px] leading-none">Your Cart</h1>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
                {count === 0
                    ? "Your Cart Is Empty"
                    : `${count} Course${count === 1 ? "" : "s"} In Your Cart`}
            </p>

            {count === 0 ? (
                <Empty className="mt-6 rounded-xl border bg-card py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ShoppingCartIcon />
                        </EmptyMedia>
                        <EmptyTitle>Nothing Here Yet</EmptyTitle>
                        <EmptyDescription>
                            Courses You Add To Your Cart Will Show Up Here.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard/courses" />}
                        >
                            Browse Courses
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="mt-6 grid gap-5.5 lg:grid-cols-[1fr_346px] lg:items-start">
                    <div className="flex flex-col gap-4">
                        {summary.lines.map((line) => (
                            <CartItemCard key={line.id} line={line} />
                        ))}
                    </div>
                    <OrderSummaryCard summary={summary} />
                </div>
            )}
        </div>
    );
}

export { Cart };
