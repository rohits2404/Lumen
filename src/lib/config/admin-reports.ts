import {
    ArrowUpDownIcon,
    CircleDollarSignIcon,
    UsersRoundIcon,
    WalletIcon,
    type LucideIcon,
} from "lucide-react";

import type { ReportStats } from "@/lib/admin/reports";
import type { PlatformStatFormat } from "@/lib/config/admin-overview";

export const adminReportsCopy = {
    title: "Reports",
    description: "Platform-Wide Revenue, Growth, And Refund Trends.",
    revenueHeading: "Gross Revenue By Month",
    payoutsHeading: "Instructor Payout Runs",
    payoutsDescription: "Monthly Disbursements Across The Whole Platform.",
    revenueEmpty: "No Paid Orders In The Last Six Months.",
    payoutsEmpty: "No Payout Runs Have Been Scheduled Yet.",
    recipientsEmpty: "This Run Has No Recipients.",
    recipientsPending:
        "This Run Hasn't Been Processed Yet — No Payouts Have Been Created.",
} as const;

export type ReportStatKey = keyof ReportStats;

export const reportStatCards: {
    key: ReportStatKey;
    label: string;
    icon: LucideIcon;
    format: PlatformStatFormat;
    deltaFormat: "relative" | "points";
}[] = [
    {
        key: "revenue",
        label: "Gross Revenue",
        icon: WalletIcon,
        format: "currency",
        deltaFormat: "relative",
    },
    {
        key: "platformShare",
        label: "Platform Share",
        icon: CircleDollarSignIcon,
        format: "currency",
        deltaFormat: "relative",
    },
    {
        key: "signups",
        label: "New Signups",
        icon: UsersRoundIcon,
        format: "count",
        deltaFormat: "relative",
    },
    {
        key: "refundRate",
        label: "Refund Rate",
        icon: ArrowUpDownIcon,
        format: "percent",
        deltaFormat: "points",
    },
];

export type PayoutRunStatus =
    "SCHEDULED" | "PROCESSING" | "COMPLETED" | "PARTIALLY_FAILED";

export const payoutRunStatusStyles: Record<PayoutRunStatus, string> = {
    COMPLETED: "bg-success/10 text-success",
    SCHEDULED: "bg-accent-2/10 text-accent-2",
    PROCESSING: "bg-warning/10 text-warning",
    PARTIALLY_FAILED: "bg-destructive/10 text-destructive",
};

export function payoutRunStatusLabel(
    status: PayoutRunStatus,
    failedCount: number,
) {
    if (status === "PARTIALLY_FAILED") {
        return failedCount > 0 ? `${failedCount} failed` : "Partially failed";
    }
    return {
        COMPLETED: "Completed",
        SCHEDULED: "Scheduled",
        PROCESSING: "Processing",
    }[status];
}

export const payoutStatusStyles: Record<"PENDING" | "PAID" | "FAILED", string> =
    {
        PAID: "bg-success/10 text-success",
        PENDING: "bg-warning/10 text-warning",
        FAILED: "bg-destructive/10 text-destructive",
    };

export const payoutStatusLabels: Record<"PENDING" | "PAID" | "FAILED", string> =
    {
        PAID: "Paid",
        PENDING: "Pending",
        FAILED: "Failed",
    };

export function payoutMethodLine(recipient: {
    methodType: "BANK_TRANSFER" | "PAYPAL" | "STRIPE" | null;
    methodLabel: string | null;
    methodLast4: string | null;
}) {
    if (!recipient.methodType) return null;

    const kind = {
        BANK_TRANSFER: "Bank",
        PAYPAL: "PayPal",
        STRIPE: "Stripe",
    }[recipient.methodType];

    const detail = recipient.methodLast4
        ? `••••${recipient.methodLast4}`
        : recipient.methodLabel;

    return detail ? `${kind} · ${detail}` : kind;
}
