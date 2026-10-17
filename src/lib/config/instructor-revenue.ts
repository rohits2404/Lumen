import type { LucideIcon } from "lucide-react";
import {
    ClockIcon,
    CircleDollarSignIcon,
    TicketIcon,
    WalletIcon,
} from "lucide-react";

import type { PayoutStatus } from "@/generated/prisma/client";

export const PAYOUT_HISTORY_LIMIT = 24;

export const EARNINGS_BY_COURSE_LIMIT = 8;

export const EARNING_MONTHS = 6;

export const revenueCopy = {
    title: "Revenue & Payouts",
    description: "What You Have Earned, And When It Reaches Your Account.",
    availableLabel: "Available For Payout",
    nextPayout: "Next Automatic Payout",
    nextPayoutIdle: "When Your Balance Clears",
    payoutSettings: "Payout Settings",
    primary: "Primary",
    methodSchedule: (day: string) => `Default Method · Monthly On The ${day}`,
    noMethodTitle: "No Payout Destination Yet",
    noMethodDescription: "Add One And Your Balance Is Sent Automatically.",
    earningsHeading: "Earnings By Month",
    earningsLead: (total: string, best: string | null) =>
        best === null
            ? `Total ${total}`
            : `Total ${total} · Best Month ${best}`,
    earningsEmpty: "No Earnings In The Last Six Months.",
    byCourseHeading: "Earnings By Course",
    byCourseLead: (total: string) => `This Month · ${total} Total`,
    byCourseEmpty: "Nothing Earned This Month Yet.",
    historyHeading: "Payout History",
    historyEmpty:
        "No Payout Has Been Sent Yet. Your First Arrives Once Your Balance Clears The Minimum.",
    columns: {
        reference: "Reference",
        date: "Date",
        method: "Method",
        amount: "Amount",
        status: "Status",
    },
    empty: {
        title: "Nothing Earned Yet",
        description:
            "Publish A Course And Your Sales, Your Cleared Balance And Every Payout Appear Here.",
    },
} as const;

export const revenueStatCards: {
    key: "lifetime" | "thisMonth" | "pending" | "perSale";
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "lifetime", label: "Lifetime Earnings", icon: WalletIcon },
    { key: "thisMonth", label: "This Month", icon: CircleDollarSignIcon },
    { key: "pending", label: "Pending Clearance", icon: ClockIcon },
    { key: "perSale", label: "Avg. Per Sale", icon: TicketIcon },
];

export const revenueFootnotes = {
    lifetime: (since: string | null) =>
        since === null ? "No Earnings Yet" : `Since ${since}`,
    thisMonth: (delta: string | null) =>
        delta === null ? "Vs Last Month" : `${delta} Vs Last Month`,
    pending: (days: number | null) =>
        days === null
            ? "Nothing Pending"
            : `Clears Within ${days} ${days === 1 ? "Day" : "Days"}`,
    perSale: "After Platform Share",
} as const;

export const payoutStatusBadge: Record<
    PayoutStatus,
    { label: string; className: string }
> = {
    PAID: { label: "Paid", className: "bg-success/10 text-success" },
    FAILED: {
        label: "Failed",
        className: "bg-destructive/10 text-destructive",
    },
    PENDING: { label: "In Transit", className: "bg-warning/10 text-warning" },
};
