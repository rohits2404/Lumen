"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    CheckoutElementsProvider,
    ContactDetailsElement,
    ExpressCheckoutElement,
    PaymentElement,
    useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { Spinner } from "@/components/ui/spinner";
import {
    checkoutAppearance,
    checkoutFonts,
} from "@/components/checkout/checkout-appearance";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function CheckoutPayment({
    clientSecret,
    amount,
}: {
    clientSecret: string;
    amount: number;
}) {
    return (
        <CheckoutElementsProvider
            stripe={stripePromise}
            options={{
                clientSecret,
                elementsOptions: {
                    appearance: checkoutAppearance,
                    fonts: checkoutFonts,
                },
            }}
        >
            <PaymentColumn amount={amount} />
        </CheckoutElementsProvider>
    );
}

type ExpressStatus = "pending" | "available" | "unavailable";

function PaymentColumn({ amount }: { amount: number }) {
    const checkout = useCheckoutElements();
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [express, setExpress] = React.useState<ExpressStatus>("pending");

    const formatted = `$${amount.toFixed(2)}`;

    async function onPay() {
        if (checkout.type !== "success") return;

        setSubmitting(true);
        setError(null);

        const result = await checkout.checkout.confirm();

        if (result.type === "error") {
            setError(
                result.error.message ?? "Something Went Wrong. Try Again.",
            );
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col bg-card px-9.5 pt-9.5 pb-9.5">
            <p className="text-[15px] leading-5.5 text-muted-foreground">
                Pay {siteConfig.legalName}
            </p>
            <p className="mt-4 text-[32px] leading-none font-extrabold tracking-[-0.02em]">
                {formatted}
            </p>

            {checkout.type === "loading" ? (
                <div className="mt-6 flex h-130 items-center justify-center">
                    <Spinner className="size-5 text-muted-foreground" />
                </div>
            ) : checkout.type === "error" ? (
                <p className="mt-6 text-sm text-destructive">
                    {checkout.error.message}
                </p>
            ) : (
                <>
                    <div
                        className={cn(
                            express === "available" && "mt-5.5",
                            express === "unavailable" && "hidden",
                        )}
                    >
                        <ExpressCheckoutElement
                            options={{
                                buttonHeight: 46,
                                buttonTheme: undefined,
                                buttonType: undefined,
                                layout: {
                                    maxColumns: 1,
                                    maxRows: 1,
                                    overflow: "auto",
                                },
                                paymentMethodOrder: undefined,
                                paymentMethods: undefined,
                            }}
                            onReady={({ availablePaymentMethods }) => {
                                setExpress(
                                    availablePaymentMethods
                                        ? "available"
                                        : "unavailable",
                                );
                            }}
                            onLoadError={() => setExpress("unavailable")}
                            onConfirm={async (event) => {
                                await checkout.checkout.confirm({
                                    expressCheckoutConfirmEvent: event,
                                });
                            }}
                        />
                    </div>

                    {express === "available" ? (
                        <div className="mt-4.5 flex items-center gap-3.5 leading-5">
                            <span className="h-px flex-1 bg-border" />
                            <span className="text-[13px] text-muted-foreground">
                                Pay With Card
                            </span>
                            <span className="h-px flex-1 bg-border" />
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            express === "available" ? "mt-5" : "mt-7",
                        )}
                    >
                        <ContactDetailsElement options={{}} />
                    </div>
                    <div className="mt-4.5">
                        <PaymentElement
                            options={{
                                layout: "tabs",
                                wallets: { link: "never" },
                            }}
                        />
                    </div>

                    {error ? (
                        <p
                            role="alert"
                            className="mt-4 text-[13px] text-destructive"
                        >
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="button"
                        onClick={onPay}
                        disabled={submitting || !checkout.checkout.canConfirm}
                        className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#625cf6] text-[15px] font-semibold text-white transition-colors hover:bg-[#5750e8] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? <Spinner className="size-4" /> : null}
                        Pay {formatted}
                    </button>

                    <p className="mt-3.5 text-center text-[13px] leading-5 text-muted-foreground">
                        Powered By{" "}
                        <span className="font-bold text-foreground/70">
                            Stripe
                        </span>
                        <span className="px-1.5">·</span>
                        <a
                            href="https://stripe.com/legal/consumer"
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2 hover:text-foreground"
                        >
                            Terms
                        </a>{" "}
                        <a
                            href="https://stripe.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2 hover:text-foreground"
                        >
                            Privacy
                        </a>
                    </p>
                </>
            )}
        </div>
    );
}

export { CheckoutPayment };
