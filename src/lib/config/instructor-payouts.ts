import { CreditCardIcon, WalletIcon, type LucideIcon } from "lucide-react";

export const payoutSettingsCopy = {
    title: "Payout Settings",
    description:
        "Choose Where Your Earnings Are Sent And How Often. Changes Apply To The Next Scheduled Payout.",

    methodsHeading: "Payout Methods",
    addMethod: "Add Payout Method",
    editMethod: "Edit",
    emptyTitle: "No Payout Method Yet",
    emptyDescription:
        "Add A Bank Account Or PayPal Address So Your Earnings Have Somewhere To Go.",

    scheduleHeading: "Payout Schedule",
    scheduleFixed: "Fixed",

    receiptTitle: "Email Me Each Payout Receipt",
    receiptDescription:
        "A Summary Lands In Your Inbox Whenever Funds Are Sent.",

    submit: "Save Payout Settings",
    saved: "Payout Settings Saved.",
} as const;

export const payoutScheduleIsFixed = true;

export const payoutMethodDialogCopy = {
    createTitle: "Add Payout Method",
    editTitle: "Edit Payout Method",
    description:
        "Where Your Earnings Are Sent. We Only Ever Store The Last Four Digits Of An Account Number.",

    typeLabel: "Method",
    bankNameLabel: "Bank Name",
    bankNamePlaceholder: "Barclays",
    last4Label: "Account Ending",
    last4Placeholder: "4471",
    paypalLabel: "PayPal Email",
    paypalPlaceholder: "you@example.com",
    currencyLabel: "Currency",

    primaryTitle: "Use As My Primary Payout Method",
    primaryDescription: "Earnings Are Sent Here First; The Rest Are Fallbacks.",
    primaryOnlyDescription:
        "Your Only Payout Method, So This Is Where Earnings Are Sent.",

    createSubmit: "Add Payout Method",
    editSubmit: "Save Changes",
    remove: "Remove Method",
} as const;

export type PayoutMethodTypeValue = "BANK_TRANSFER" | "PAYPAL";
export type PayoutMethodRoleValue = "PRIMARY" | "BACKUP";

export const payoutMethodTypes: {
    value: PayoutMethodTypeValue;
    label: string;
    icon: LucideIcon;
}[] = [
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: CreditCardIcon },
    { value: "PAYPAL", label: "PayPal", icon: WalletIcon },
];

export const payoutMethodTypeValues = new Set<string>(
    payoutMethodTypes.map((type) => type.value),
);

export function payoutMethodTypeLabel(type: PayoutMethodTypeValue) {
    return type === "PAYPAL" ? "PayPal" : "Bank Transfer";
}

export const payoutRoleBadges: Record<
    PayoutMethodRoleValue,
    { label: string; className: string }
> = {
    PRIMARY: { label: "Primary", className: "border-info text-info" },
    BACKUP: {
        label: "Backup",
        className: "border-muted-foreground/60 text-muted-foreground",
    },
};

export { platformCurrencies as payoutCurrencies } from "@/lib/config/admin-settings";

export const PAYOUT_LABEL_MAX_LENGTH = 120;

export const PAYOUT_LAST4_LENGTH = 4;

export const MAX_PAYOUT_METHODS = 5;
