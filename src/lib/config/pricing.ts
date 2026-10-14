export type BillingPeriod = "monthly" | "yearly";

export const BUSINESS_PLAN_ID = "lumen-business";

export const BUSINESS_PLAN_KEY = "business";

export type Plan = {
    id: string;
    name: string;
    price: Record<BillingPeriod, string>;
    suffix: Record<BillingPeriod, string>;
    description: string;
    features: string[];
    cta: { label: string; href: string };
    featured?: boolean;
};

export const plans: Plan[] = [
    {
        id: "per-course",
        name: "Per Course",
        price: { monthly: "$12–17", yearly: "$12–17" },
        suffix: { monthly: "One-Off", yearly: "One-Off" },
        description: "Buy A Course Outright And Keep It For Life.",
        features: [
            "Lifetime Access To What You Buy",
            "Certificate On Completion",
            "Full Q&A And Discussions",
            "30-Day Refund Guarantee",
        ],
        cta: { label: "Browse Courses", href: "/courses" },
    },
    {
        id: "lumen-business",
        name: "Lumen Business",
        price: { monthly: "$29", yearly: "$299" },
        suffix: { monthly: "/Month", yearly: "/Year" },
        description:
            "Every Course From Every Instructor, While Your Plan Is Active.",
        features: [
            "All 12,000 Courses Unlocked",
            "New Releases Included",
            "Team Seats And Reporting",
            "Priority Support",
            "Cancel Any Time",
        ],
        cta: { label: "Get Lumen Business", href: "/register" },
        featured: true,
    },
    {
        id: "teach-on-lumen",
        name: "Teach On Lumen",
        price: { monthly: "Free", yearly: "Free" },
        suffix: { monthly: "To Publish", yearly: "To Publish" },
        description: "No Listing Fees. You Only Share Revenue When You Earn.",
        features: [
            "Unlimited Courses And Students",
            "Keep Up To 70% Of Revenue",
            "Analytics, Coupons, And Payouts",
            "Monthly Payouts From $100",
        ],
        cta: { label: "Become An Instructor", href: "/teach" },
    },
];

export type BusinessOfferState =
    "anonymous" | "available" | "subscribed" | "unconfigured";

export const businessCta: Record<
    BusinessOfferState,
    { label: string; hint?: string }
> = {
    anonymous: { label: "Get Lumen Business" },
    available: { label: "Get Lumen Business" },
    subscribed: { label: "Manage Plan", hint: "You Are On This Plan." },
    unconfigured: {
        label: "Get Lumen Business",
        hint: "Subscriptions Aren't Configured Yet.",
    },
};

export type BusinessOffer = {
    state: BusinessOfferState;
    price: Record<BillingPeriod, string>;
    suffix: Record<BillingPeriod, string>;
};
