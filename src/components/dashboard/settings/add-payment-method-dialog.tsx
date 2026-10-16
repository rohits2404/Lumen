"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
    checkoutAppearance,
    checkoutFonts,
} from "@/components/checkout/checkout-appearance";
import { createSetupIntent, syncPaymentMethods } from "@/lib/actions/billing";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function AddPaymentMethodRow({ disabled }: { disabled?: boolean }) {
    const [open, setOpen] = React.useState(false);
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    async function onOpenChange(next: boolean) {
        setOpen(next);
        if (!next) {
            setClientSecret(null);
            return;
        }

        setLoading(true);
        const result = await createSetupIntent();
        setLoading(false);

        if (!result.ok) {
            setOpen(false);
            toast.add({ title: result.message, type: "error" });
            return;
        }
        setClientSecret(result.clientSecret);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger
                render={
                    <button
                        type="button"
                        disabled={disabled}
                        className="flex h-12.5 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-border text-sm font-medium transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                    />
                }
            >
                <PlusIcon className="size-4" />
                Add Payment Method
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add a Payment Method</DialogTitle>
                    <DialogDescription>
                        Saved Securely By Stripe So Your Next Course Is One Tap.
                        Lumen Never Sees Your Card Number.
                    </DialogDescription>
                </DialogHeader>

                {clientSecret ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: checkoutAppearance,
                            fonts: checkoutFonts,
                        }}
                    >
                        <SetupForm onDone={() => setOpen(false)} />
                    </Elements>
                ) : (
                    <div className="flex h-40 items-center justify-center">
                        {loading ? (
                            <Spinner className="size-5 text-muted-foreground" />
                        ) : null}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SetupForm({ onDone }: { onDone: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        setError(null);

        const { error: confirmError } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/settings/billing`,
            },
            redirect: "if_required",
        });

        if (confirmError) {
            setSubmitting(false);
            setError(confirmError.message ?? "We Couldn't Save That Card.");
            return;
        }

        const result = await syncPaymentMethods();
        setSubmitting(false);
        toast.add({
            title: result.message,
            type: result.ok ? "success" : "error",
        });
        if (result.ok) onDone();
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <PaymentElement
                options={{
                    wallets: {
                        link: "never",
                        applePay: "never",
                        googlePay: "never",
                    },
                }}
            />
            {error ? (
                <p className="text-[13px] text-destructive">{error}</p>
            ) : null}
            <Button
                type="submit"
                loading={submitting}
                disabled={!stripe}
                className="h-11 w-full"
            >
                {submitting ? "Saving…" : "Save Card"}
            </Button>
        </form>
    );
}

export { AddPaymentMethodRow };
