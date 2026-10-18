"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PayoutRunDialog } from "@/components/dashboard/admin/reports/payout-run-dialog";
import type { PayoutRunRow } from "@/lib/admin/reports";
import {
    adminReportsCopy,
    payoutRunStatusLabel,
    payoutRunStatusStyles,
} from "@/lib/config/admin-reports";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});
const counts = new Intl.NumberFormat("en-US");
const longDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});

const headClass = "h-10 px-1 text-[13px] font-normal text-muted-foreground";

function PayoutRunsCard({ runs }: { runs: PayoutRunRow[] }) {
    const [openRun, setOpenRun] = React.useState<PayoutRunRow | null>(null);

    return (
        <Card className="gap-0 px-6 ring-border [--card-spacing:--spacing(6)]">
            <h2 className="text-[17px] leading-none font-bold">
                {adminReportsCopy.payoutsHeading}
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
                {adminReportsCopy.payoutsDescription}
            </p>

            {runs.length === 0 ? (
                <p className="py-14 text-center text-sm text-muted-foreground">
                    {adminReportsCopy.payoutsEmpty}
                </p>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <Table className="min-w-180 border-b border-border-subtle">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className={cn(headClass, "w-[20%]")}>
                                    Run
                                </TableHead>
                                <TableHead className={cn(headClass, "w-[20%]")}>
                                    Date
                                </TableHead>
                                <TableHead className={cn(headClass, "w-[18%]")}>
                                    Recipients
                                </TableHead>
                                <TableHead className={cn(headClass, "w-[19%]")}>
                                    Total
                                </TableHead>
                                <TableHead className={headClass}>
                                    Status
                                </TableHead>
                                <TableHead className={cn(headClass, "w-23")}>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {runs.map((run) => (
                                <TableRow
                                    key={run.id}
                                    className="hover:bg-transparent"
                                >
                                    <TableCell className="h-15 px-1 text-[15px] font-semibold">
                                        {run.reference}
                                    </TableCell>
                                    <TableCell className="h-15 px-1 text-[15px] text-muted-foreground">
                                        {longDate.format(run.scheduledFor)}
                                    </TableCell>
                                    <TableCell className="h-15 px-1 text-[15px] text-muted-foreground tabular-nums">
                                        {counts.format(run.recipientCount)}
                                    </TableCell>
                                    <TableCell className="h-15 px-1 text-[15px] font-semibold tabular-nums">
                                        {money.format(run.totalCents / 100)}
                                    </TableCell>
                                    <TableCell className="h-15 px-1">
                                        <span
                                            className={cn(
                                                "inline-flex rounded-full px-2.5 py-1 text-[13px] font-medium",
                                                payoutRunStatusStyles[
                                                    run.status
                                                ],
                                            )}
                                        >
                                            {payoutRunStatusLabel(
                                                run.status,
                                                run.failedCount,
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="h-15 px-1 text-right">
                                        <Button
                                            variant="outline"
                                            onClick={() => setOpenRun(run)}
                                            aria-label={`View ${run.reference}`}
                                            className="h-9 bg-card px-4 text-sm shadow-sm"
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {openRun ? (
                <PayoutRunDialog
                    key={openRun.id}
                    run={openRun}
                    open
                    onOpenChange={(next) => {
                        if (!next) setOpenRun(null);
                    }}
                />
            ) : null}
        </Card>
    );
}

export { PayoutRunsCard };
