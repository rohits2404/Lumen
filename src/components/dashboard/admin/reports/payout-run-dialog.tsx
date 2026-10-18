"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { loadPayoutRun } from "@/lib/actions/admin-reports";
import type { PayoutRunDetail, PayoutRunRow } from "@/lib/admin/reports";
import {
    adminReportsCopy,
    payoutMethodLine,
    payoutRunStatusLabel,
    payoutRunStatusStyles,
    payoutStatusLabels,
    payoutStatusStyles,
} from "@/lib/config/admin-reports";
import { initialsOf } from "@/lib/user";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});
const counts = new Intl.NumberFormat("en-US");
const longDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});

function PayoutRunDialog({
    run,
    open,
    onOpenChange,
}: {
    run: PayoutRunRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [detail, setDetail] = React.useState<PayoutRunDetail | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let active = true;
        loadPayoutRun(run.id)
            .then((result) => {
                if (!active) return;
                if (result.ok) setDetail(result.run);
                else setError(result.message);
            })
            .catch(() => {
                if (active) setError("Those recipients could not be loaded.");
            });
        return () => {
            active = false;
        };
    }, [run.id]);

    const scheduled = run.status === "SCHEDULED";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-8 sm:max-w-154.5">
                <DialogHeader className="gap-0">
                    <DialogTitle className="flex flex-wrap items-center gap-3 text-[22px] font-bold">
                        {run.reference}
                        <span
                            className={cn(
                                "rounded-full px-2.5 py-1 text-[13px] font-medium",
                                payoutRunStatusStyles[run.status],
                            )}
                        >
                            {payoutRunStatusLabel(run.status, run.failedCount)}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm">
                        {scheduled ? "Scheduled for" : "Disbursed"}{" "}
                        {longDate.format(run.scheduledFor)} ·{" "}
                        {counts.format(run.recipientCount)}{" "}
                        {run.recipientCount === 1
                            ? "instructor"
                            : "instructors"}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                        {
                            label: "Total disbursed",
                            value: money.format(run.totalCents / 100),
                        },
                        {
                            label: "Recipients",
                            value: counts.format(run.recipientCount),
                        },
                        {
                            label: "Average payout",
                            value:
                                detail?.averageCents != null
                                    ? money.format(detail.averageCents / 100)
                                    : "—",
                        },
                    ].map((tile) => (
                        <div
                            key={tile.label}
                            className="rounded-xl bg-soft px-4 py-3.5"
                        >
                            <p className="text-lg leading-tight font-bold tabular-nums">
                                {tile.value}
                            </p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                {tile.label}
                            </p>
                        </div>
                    ))}
                </div>

                <h3 className="mt-6 mb-3 text-base font-bold">Recipients</h3>

                <div className="flex max-h-84 flex-col gap-3 overflow-y-auto pb-1">
                    {error ? (
                        <p className="py-8 text-center text-sm text-destructive">
                            {error}
                        </p>
                    ) : !detail ? (
                        <div className="grid place-items-center py-12">
                            <Spinner className="size-5 text-muted-foreground" />
                        </div>
                    ) : detail.recipients.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {scheduled
                                ? adminReportsCopy.recipientsPending
                                : adminReportsCopy.recipientsEmpty}
                        </p>
                    ) : (
                        detail.recipients.map((recipient) => {
                            const line = payoutMethodLine(recipient);
                            return (
                                <div
                                    key={recipient.id}
                                    className="flex items-center gap-3.5 rounded-xl bg-soft px-4 py-3"
                                >
                                    <Avatar className="size-9.5">
                                        <AvatarImage
                                            src={
                                                recipient.imageUrl ?? undefined
                                            }
                                            alt=""
                                            referrerPolicy="no-referrer"
                                        />
                                        <AvatarFallback className="bg-hover text-xs font-semibold text-foreground">
                                            {initialsOf(recipient.name, "")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-[15px] font-semibold">
                                            {recipient.name}
                                        </span>
                                        {line ? (
                                            <span className="truncate text-[13px] text-muted-foreground">
                                                {line}
                                            </span>
                                        ) : null}
                                    </div>

                                    <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                                        {money.format(
                                            recipient.amountCents / 100,
                                        )}
                                    </span>
                                    <span
                                        className={cn(
                                            "shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium",
                                            payoutStatusStyles[
                                                recipient.status
                                            ],
                                        )}
                                    >
                                        {payoutStatusLabels[recipient.status]}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { PayoutRunDialog };
