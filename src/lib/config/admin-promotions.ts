import { PercentIcon, TagIcon, type LucideIcon } from "lucide-react";

import type {
    PromotionDiscountType,
    PromotionScope,
} from "@/generated/prisma/client";

export const PARTICIPATION_PAGE_SIZE = 6;

export const PAST_PROMOTIONS_LIMIT = 24;

export const PROMOTION_NAME_MAX_LENGTH = 60;

export const MIN_PERCENT_OFF = 1;
export const MAX_PERCENT_OFF = 99;

export const MIN_FIXED_PRICE_CENTS = 50;
export const MAX_FIXED_PRICE_CENTS = 99_999;

export const MAX_PROMOTION_DAYS = 365;

export const adminPromotionsCopy = {
    title: "Promotions",
    description:
        "Platform-Wide Sales. Applied Automatically To Every Opted-In Course.",
    newPromotion: "New Promotion",
    edit: "Edit",
    endSale: "End Sale",
    cancelSale: "Cancel Sale",
    heroStats: {
        redemptions: "Redemptions",
        revenue: "Sale Revenue",
        included: "Courses Included",
        optedOut: "Opted Out",
    },
    activeEmptyTitle: "No Sale Is Running",
    activeEmptyDescription:
        "Launch A Promotion And It Will Appear Here With Its Redemptions And Revenue While It Runs.",
    participationHeading: "Instructor Participation",
    participationLead:
        "Instructors Choose Whether Their Courses Join Lumen Promotions. Opted-Out Courses Keep Their List Price.",
    participationEmptyTitle: "No Instructors Yet",
    participationEmptyDescription:
        "Approve An Instructor Application And Their Participation Switch Will Appear Here.",
    participationToggleLabel: (instructor: string) =>
        `${instructor} Joins Lumen Promotions`,
    courses: (count: number) =>
        `${count.toLocaleString("en-US")} ${count === 1 ? "Course" : "Courses"}`,
    students: (count: number) =>
        `${count.toLocaleString("en-US")} ${count === 1 ? "Student" : "Students"}`,
    pastHeading: "Past Promotions",
    pastEmptyTitle: "No Past Promotions",
    pastEmptyDescription:
        "A Sale Moves Here Once It Ends, With The Redemptions And Revenue It Earned.",
    pastColumns: {
        promotion: "Promotion",
        discount: "Discount",
        scope: "Scope",
        redemptions: "Redemptions",
        revenue: "Revenue",
    },
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${
            total === 1 ? "Instructor" : "Instructors"
        }`,
} as const;

export type Pill = { label: string; className: string };

export function promotionStatePill(live: boolean): Pill {
    return live
        ? { label: "Live Now", className: "bg-success text-white" }
        : { label: "Scheduled", className: "bg-hover text-muted-foreground" };
}

export function participationPill(participating: boolean): Pill {
    return participating
        ? { label: "Participating", className: "bg-success/10 text-success" }
        : { label: "Opted Out", className: "bg-hover text-muted-foreground" };
}

export const promotionDialogCopy = {
    createTitle: "New Promotion",
    editTitle: "Edit Promotion",
    description:
        "This Price Is Applied Platform-Wide And Overrides Instructor List Prices For The Duration Of The Sale.",
    nameLabel: "Promotion Name",
    namePlaceholder: "E.g. Autumn Skills Sale",
    discountTypeLabel: "Discount Type",
    percentLabel: "Percentage Off",
    percentPlaceholder: "70",
    fixedLabel: "Sale Price",
    fixedPlaceholder: "9.99",
    fixedPrefix: "$",
    applyToLabel: "Apply To",
    categoriesLabel: "Categories",
    categoriesEmpty: "No Categories Exist Yet — Create One First.",
    startsLabel: "Starts",
    startsPlaceholder: "Immediately",
    endsLabel: "Ends",
    endsPlaceholder: "Pick A Date",
    forceTitle: "Force On All Courses",
    forceDescription:
        "Overrides Instructor Opt-Out. Use Only For Platform-Wide Events.",
    createSubmit: "Launch Promotion",
    editSubmit: "Save Changes",
} as const;

export const discountTypeOptions: {
    value: PromotionDiscountType;
    label: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        value: "PERCENT",
        label: "Percentage Off",
        description: "Every Course Drops By The Same Percentage.",
        icon: PercentIcon,
    },
    {
        value: "FIXED_PRICE",
        label: "Fixed Sale Price",
        description: "Every Course Is Sold At One Flat Price.",
        icon: TagIcon,
    },
];

export const promotionScopeOptions: {
    value: PromotionScope;
    label: string;
}[] = [
    { value: "ALL_COURSES", label: "All Courses" },
    { value: "CATEGORIES", label: "Specific Categories" },
];

export function isPromotionDiscountType(
    value: unknown,
): value is PromotionDiscountType {
    return value === "PERCENT" || value === "FIXED_PRICE";
}

export function isPromotionScope(value: unknown): value is PromotionScope {
    return value === "ALL_COURSES" || value === "CATEGORIES";
}
