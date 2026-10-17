import Link from "next/link";
import { CalendarIcon, CreditCardIcon, SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/components/dashboard/instructor/revenue/revenue-format";
import {
    methodTitle,
    ordinal,
} from "@/components/dashboard/instructor/settings/payouts-format";
import { revenueCopy } from "@/lib/config/instructor-revenue";
import type { PayoutMethodView } from "@/lib/instructor-payouts";

function BalanceCard({
    availableCents,
    nextPayoutOn,
    method,
    payoutDayOfMonth,
}: {
    availableCents: number;
    nextPayoutOn: string | null;
    method: PayoutMethodView | null;
    payoutDayOfMonth: number;
}) {
    return (
        <Card className="gap-0 p-6.5 ring-border [--card-spacing:0px]">
            <p className="text-[15px] text-muted-foreground">
                {revenueCopy.availableLabel}
            </p>
            <p className="stat-figure mt-2 text-[50px]">
                {formatMoney(availableCents)}
            </p>

            <p className="mt-4 flex flex-wrap items-center gap-2 text-[15px]">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                {revenueCopy.nextPayout}
                <span className="text-muted-foreground">
                    {nextPayoutOn ?? revenueCopy.nextPayoutIdle}
                </span>
            </p>

            <Button
                nativeButton={false}
                render={<Link href="/dashboard/instructor/settings/payouts" />}
                className="mt-5 h-10 w-fit gap-2 px-5"
            >
                <SettingsIcon className="size-4" />
                {revenueCopy.payoutSettings}
            </Button>

            <div className="mt-5.5 flex min-h-17 items-center gap-4 rounded-xl bg-background px-4 dark:bg-background">
                <div className="grid size-9.5 shrink-0 place-items-center rounded-lg bg-hover">
                    <CreditCardIcon className="size-4.5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                        {method === null
                            ? revenueCopy.noMethodTitle
                            : methodTitle(method)}
                    </p>
                    <p className="truncate text-[14px] text-muted-foreground">
                        {method === null
                            ? revenueCopy.noMethodDescription
                            : revenueCopy.methodSchedule(
                                  ordinal(payoutDayOfMonth),
                              )}
                    </p>
                </div>

                {method === null ? null : (
                    <span className="shrink-0 rounded-full border border-accent-2 px-2.5 py-0.5 text-[13px] leading-4 font-medium text-accent-2">
                        {revenueCopy.primary}
                    </span>
                )}
            </div>
        </Card>
    );
}

export { BalanceCard };
