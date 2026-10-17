export type CouponTab = "all" | "active" | "scheduled" | "expired";

export const couponTabs: { value: CouponTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "scheduled", label: "Scheduled" },
    { value: "expired", label: "Expired" },
];

export const couponTabValues = new Set<string>(
    couponTabs.map((tab) => tab.value),
);

export type CouponStatus = "active" | "scheduled" | "expired";

export const couponStatusLabel: Record<CouponStatus, string> = {
    active: "Active",
    scheduled: "Scheduled",
    expired: "Expired",
};

export const couponStatusBadge: Record<CouponStatus, string> = {
    active: "bg-success/10 text-success",
    scheduled: "bg-info/10 text-info",
    expired: "bg-hover text-muted-foreground",
};

export const discountTypes = [
    {
        value: "PERCENT" as const,
        title: "Percentage Off",
        description: "e.g. 40% Off The List Price",
    },
    {
        value: "FIXED_PRICE" as const,
        title: "Fixed Price",
        description: "e.g. Sell At $9.99 Flat",
    },
];

export const ACTIVE_COUPONS_PER_COURSE = 3;

export const COUPONS_PAGE_SIZE = 5;

export const COUPON_CODE_MAX = 24;
export const COUPON_CODE_MIN = 3;

export const couponsCopy = {
    title: "Coupons",
    description: "Discount Codes Across Every Course You Teach.",
    newCoupon: "New Coupon",
    allCourses: "All Courses",
    edit: "Edit",
    empty: {
        title: "No Coupons Yet",
        description:
            "Create A Discount Code And It Will Apply At Checkout For The Course You Choose.",
    },
    noMatches: "No Coupons Match This Filter.",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${total === 1 ? "Coupon" : "Coupons"}`,
} as const;

export const couponStats = {
    active: "Active Coupons",
    redemptions: "Total Redemptions",
    revenue: "Revenue From Coupons",
    averageDiscount: "Avg. Discount Given",
} as const;

export const couponDialogCopy = {
    createTitle: "Create Coupon",
    editTitle: "Edit Coupon",
    description: `Codes Are Case-Insensitive And Apply At Checkout. You Can Run Up To ${ACTIVE_COUPONS_PER_COURSE} Active Coupons Per Course.`,
    code: "Coupon Code",
    codePlaceholder: "AUTUMN30",
    appliesTo: "Applies To",
    appliesToPlaceholder: "Choose A Course",
    discountType: "Discount Type",
    percentOff: "Percentage Off",
    fixedPrice: "Price",
    redemptionLimit: "Redemption Limit",
    redemptionLimitPlaceholder: "Unlimited",
    starts: "Starts",
    startsPlaceholder: "Immediately",
    expires: "Expires",
    expiresPlaceholder: "Never",
    create: "Create Coupon",
    save: "Save Changes",
    earningsNote: (discounted: string, payout: string, list: string) =>
        `Your Earnings Are Calculated On The Discounted Price. This Coupon Sells A ${list} Course At ${discounted} And Pays Out Roughly ${payout} Per Sale.`,
    earningsNotePending:
        "Your Earnings Are Calculated On The Discounted Price, Not The List Price.",
} as const;
