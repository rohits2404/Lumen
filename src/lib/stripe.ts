import "server-only";

import Stripe from "stripe";

let client: Stripe | null | undefined;

function getStripe() {
    if (client === undefined) {
        const key = process.env.STRIPE_SECRET_KEY;
        client = key ? new Stripe(key) : null;
    }

    return client;
}

function isStripeConfigured() {
    return Boolean(
        process.env.STRIPE_SECRET_KEY &&
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );
}

export { getStripe, isStripeConfigured };
