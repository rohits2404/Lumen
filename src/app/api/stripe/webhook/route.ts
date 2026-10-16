import { after, NextResponse } from "next/server";

import {
    expireCheckoutSession,
    failCheckoutSession,
    fulfillCheckoutSession,
} from "@/lib/orders";
import {
    cancelSubscription,
    fulfillSubscriptionCheckout,
    syncInvoiceSubscription,
    syncSubscription,
} from "@/lib/subscription-sync";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !secret) {
        return NextResponse.json(
            { error: "Stripe Webhooks Are Not Configured." },
            { status: 503 },
        );
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.json(
            { error: "Missing Signature." },
            { status: 400 },
        );
    }

    const payload = await request.text();

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            payload,
            signature,
            secret,
        );
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Invalid Payload.";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    after(async () => {
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
                await fulfillCheckoutSession(event.data.object);
                await fulfillSubscriptionCheckout(event.data.object);
                break;
            }

            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.paused":
            case "customer.subscription.resumed": {
                await syncSubscription(event.data.object);
                break;
            }
            case "customer.subscription.deleted": {
                await cancelSubscription(event.data.object);
                break;
            }
            case "invoice.paid":
            case "invoice.payment_failed": {
                await syncInvoiceSubscription(event.data.object);
                break;
            }
            case "checkout.session.async_payment_failed": {
                await failCheckoutSession(event.data.object);
                break;
            }
            case "checkout.session.expired": {
                await expireCheckoutSession(event.data.object);
                break;
            }
            default:
                break;
        }
    });

    return NextResponse.json({ received: true });
}
