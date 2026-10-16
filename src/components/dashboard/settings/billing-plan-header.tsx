import { ChangePlanButton } from "@/components/dashboard/settings/billing-actions";
import type { BillingPlan } from "@/lib/billing";

function money(cents: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function planSummary(plan: BillingPlan) {
    const parts = [`Billing ${plan.interval}`];

    if (plan.cancelAtPeriodEnd && plan.nextPaymentAt) {
        parts.push(
            `Cancels on ${plan.nextPaymentAt.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })}`,
        );
        return parts.join(" · ");
    }

    if (plan.status === "past_due" || plan.status === "unpaid") {
        parts.push("Payment Failed — Update Your Card To Keep Access");
        return parts.join(" · ");
    }

    if (plan.nextPaymentAt) {
        const date = plan.nextPaymentAt.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });
        parts.push(
            plan.amountCents === null
                ? `Next Payment On ${date}`
                : `Next Payment On ${date} For ${money(plan.amountCents, plan.currency)}`,
        );
    }

    return parts.join(" · ");
}

function BillingPlanHeader({
    plan,
    configured,
}: {
    plan: BillingPlan | null;
    configured: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="text-[20px] leading-none font-bold">Billing</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    {!configured
                        ? "Billing Isn't Configured For This Environment Yet."
                        : plan
                          ? planSummary(plan)
                          : "No Active Plan · You Pay Per Course, With Nothing Recurring."}
                </p>
            </div>
            <ChangePlanButton disabled={!configured} />
        </div>
    );
}

export { BillingPlanHeader };
