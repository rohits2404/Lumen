"use client";

import { Button } from "@/components/ui/button";
import {
    methodDescription,
    methodTitle,
} from "@/components/dashboard/instructor/settings/payouts-format";
import {
    payoutMethodTypes,
    payoutRoleBadges,
    payoutSettingsCopy,
} from "@/lib/config/instructor-payouts";
import type { PayoutMethodView } from "@/lib/instructor-payouts";
import { cn } from "@/lib/utils";

function PayoutMethodRow({
    method,
    onEdit,
}: {
    method: PayoutMethodView;
    onEdit: () => void;
}) {
    const Icon =
        payoutMethodTypes.find((type) => type.value === method.type)?.icon ??
        payoutMethodTypes[0]!.icon;
    const badge = payoutRoleBadges[method.role];

    return (
        <div className="flex h-18 items-center gap-4 rounded-xl bg-background px-5">
            <span
                aria-hidden
                className="grid size-9.5 shrink-0 place-items-center rounded-xl bg-hover"
            >
                <Icon className="size-4.5 text-foreground/80" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] leading-5 font-semibold">
                    {methodTitle(method)}
                </p>
                <p className="truncate text-[13px] leading-4.5 text-muted-foreground">
                    {methodDescription(method)}
                </p>
            </div>

            <span
                className={cn(
                    "hidden h-5.5 shrink-0 items-center rounded-full border px-3 text-[13px] font-medium sm:inline-flex",
                    badge.className,
                )}
            >
                {badge.label}
            </span>

            <Button
                type="button"
                variant="outline"
                onClick={onEdit}
                aria-label={`Edit ${methodTitle(method)}`}
                className="h-8.5 shrink-0 bg-card px-4 text-[13px] shadow-sm"
            >
                {payoutSettingsCopy.editMethod}
            </Button>
        </div>
    );
}

export { PayoutMethodRow };
