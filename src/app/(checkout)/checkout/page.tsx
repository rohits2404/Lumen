import { CheckoutPayment } from "@/components/checkout/checkout-payment";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { getCart } from "@/lib/cart";
import { isStripeConfigured } from "@/lib/stripe";
import { CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const CheckoutPage = async () => {
    const cart = await getCart();

    if (cart.lines.length === 0) {
        redirect("/dashboard/cart");
    }

    if (!isStripeConfigured()) {
        return (
            <main className="mx-auto w-full max-w-253 px-6 py-4.5">
                <Empty className="rounded-2xl border bg-card py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CreditCardIcon />
                        </EmptyMedia>
                        <EmptyTitle>
                            Checkout Isn&apos;t Configured Yet
                        </EmptyTitle>
                        <EmptyDescription>
                            Add <code>STRIPE_SECRET_KEY</code> and{" "}
                            <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to{" "}
                            <code>.env</code> To Take Payments. Your Cart Is
                            Safe In The Meantime.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            nativeButton={false}
                            render={<Link href="/dashboard/cart" />}
                        >
                            Back To Cart
                        </Button>
                    </EmptyContent>
                </Empty>
            </main>
        );
    }

    const clientSecret = await createCheckoutSession();

    return (
        <main className="mx-auto w-full max-w-253 px-6 py-4.5">
            <div className="grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[493px_1fr] md:items-stretch">
                <div className="border-b md:border-r md:border-b-0">
                    <CheckoutSummary summary={cart} />
                </div>
                <CheckoutPayment
                    clientSecret={clientSecret}
                    amount={cart.total}
                />
            </div>
        </main>
    );
};

export default CheckoutPage;
