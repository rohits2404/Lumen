import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const CheckoutReturnPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>;
}) => {
    const { session_id: sessionId } = await searchParams;
    const stripe = getStripe();
    const session = await getSession();

    if (!sessionId || !stripe || !session) {
        redirect("/dashboard/cart");
    }

    const checkout = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkout.status === "open") {
        redirect("/checkout");
    }

    const order = await db.order.findFirst({
        where: { stripeSessionId: sessionId, userId: session.user.id },
        include: { items: true },
    });

    if (!order) {
        redirect("/dashboard/cart");
    }

    const paid = order.status === "PAID";
    const failed = order.status === "FAILED";
    const email = checkout.customer_details?.email ?? order.email;

    const Icon = paid ? CheckCircle2Icon : failed ? XCircleIcon : ClockIcon;

    return (
        <main className="mx-auto flex w-full max-w-140 flex-col px-6 py-12 md:py-20">
            <Card className="items-center gap-0 px-8 py-10 text-center ring-border">
                <Icon
                    className={
                        paid
                            ? "size-11 text-success"
                            : failed
                              ? "size-11 text-destructive"
                              : "size-11 text-muted-foreground"
                    }
                />

                <h1 className="mt-5 text-[26px] leading-tight">
                    {paid
                        ? "Thank You For Your Order"
                        : failed
                          ? "Your Payment Didn't Go Through"
                          : "Your Payment Is Processing"}
                </h1>

                <p className="mt-2.5 text-[15px] text-muted-foreground">
                    {paid ? (
                        <>
                            We&apos;ve Sent a Receipt
                            {email ? <> To {email}</> : null}. Your Courses Are
                            Ready In My Learning.
                        </>
                    ) : failed ? (
                        <>
                            Your Bank Declined The Payment, So Nothing Was
                            Charged. Your Cart Is Still There If You&apos;d Like
                            To Try Again.
                        </>
                    ) : (
                        <>
                            Some Payment Methods Take a Little While To Clear.
                            We&apos;ll Email You
                            {email ? <> At {email}</> : null} The Moment It
                            Settles — You Can Close This Page.
                        </>
                    )}
                </p>

                <dl className="mt-7 w-full border-t pt-5 text-left">
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-baseline justify-between gap-4 py-1.5"
                        >
                            <dt className="text-sm">{item.title}</dt>
                            <dd className="text-sm text-muted-foreground tabular-nums">
                                ${(item.unitAmount / 100).toFixed(2)}
                            </dd>
                        </div>
                    ))}
                    <div className="mt-2 flex items-baseline justify-between gap-4 border-t pt-3">
                        <dt className="font-bold">Total</dt>
                        <dd className="font-bold tabular-nums">
                            ${(order.amountTotal / 100).toFixed(2)}
                        </dd>
                    </div>
                </dl>

                <Button
                    nativeButton={false}
                    className="mt-7 h-11 w-full text-sm font-semibold shadow-sm"
                    render={
                        <Link href={paid ? "/dashboard" : "/dashboard/cart"} />
                    }
                >
                    {paid ? "Go To Dashboard" : "Back To Cart"}
                </Button>
            </Card>
        </main>
    );
};

export default CheckoutReturnPage;
