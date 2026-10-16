import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BillingPaymentMethods } from "@/components/dashboard/settings/billing-payment-methods";
import { BillingPlanHeader } from "@/components/dashboard/settings/billing-plan-header";
import { BillingTransactions } from "@/components/dashboard/settings/billing-transactions";
import type { Billing } from "@/lib/billing";

function SettingsBilling({ billing }: { billing: Billing }) {
    return (
        <Card className="[--card-spacing:0px]">
            <div className="px-7.5 pt-7.5 pb-5.5">
                <BillingPlanHeader
                    plan={billing.plan}
                    configured={billing.configured}
                />
            </div>

            <Separator />

            <div className="px-7.5 pt-5.5 pb-7.5">
                <BillingPaymentMethods
                    cards={billing.cards}
                    configured={billing.configured}
                />
                <div className="mt-6.5">
                    <BillingTransactions transactions={billing.transactions} />
                </div>
            </div>
        </Card>
    );
}

export { SettingsBilling };
