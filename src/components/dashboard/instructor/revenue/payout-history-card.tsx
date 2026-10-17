import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatMoneyExact } from "@/components/dashboard/instructor/revenue/revenue-format";
import {
    payoutStatusBadge,
    revenueCopy,
} from "@/lib/config/instructor-revenue";
import type { PayoutRow } from "@/lib/instructor-revenue";
import { cn } from "@/lib/utils";

function PayoutHistoryCard({ rows }: { rows: PayoutRow[] }) {
    return (
        <Card className="gap-0 overflow-hidden p-6.5 ring-border [--card-spacing:0px]">
            <h2 className="text-xl leading-none font-bold">
                {revenueCopy.historyHeading}
            </h2>

            {rows.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    {revenueCopy.historyEmpty}
                </p>
            ) : (
                <div className="mt-5 overflow-x-auto">
                    <Table className="min-w-190 border-b border-border-subtle">
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="h-9.5 w-[18%] px-0 text-[14px] font-normal text-muted-foreground">
                                    {revenueCopy.columns.reference}
                                </TableHead>
                                <TableHead className="h-9.5 w-[20%] px-0 text-[14px] font-normal text-muted-foreground">
                                    {revenueCopy.columns.date}
                                </TableHead>
                                <TableHead className="h-9.5 w-[28%] px-0 text-[14px] font-normal text-muted-foreground">
                                    {revenueCopy.columns.method}
                                </TableHead>
                                <TableHead className="h-9.5 w-[19%] px-0 text-[14px] font-normal text-muted-foreground">
                                    {revenueCopy.columns.amount}
                                </TableHead>
                                <TableHead className="h-9.5 px-0 text-[14px] font-normal text-muted-foreground">
                                    {revenueCopy.columns.status}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => {
                                const badge = payoutStatusBadge[row.status];
                                return (
                                    <TableRow
                                        key={row.id}
                                        className="border-border-subtle hover:bg-transparent"
                                    >
                                        <TableCell className="h-11.75 px-0 text-[15px]">
                                            {row.reference}
                                        </TableCell>
                                        <TableCell className="h-11.75 px-0 text-[15px]">
                                            {row.date}
                                        </TableCell>
                                        <TableCell className="h-11.75 px-0 text-[15px] text-muted-foreground">
                                            {row.method ?? "—"}
                                        </TableCell>
                                        <TableCell className="h-11.75 px-0 text-[15px] font-semibold tabular-nums">
                                            {formatMoneyExact(row.amountCents)}
                                        </TableCell>
                                        <TableCell className="h-11.75 px-0">
                                            <span
                                                title={
                                                    row.failureReason ??
                                                    undefined
                                                }
                                                className={cn(
                                                    "inline-flex rounded-full px-2.5 py-0.5 text-[13px] leading-4 font-medium",
                                                    badge.className,
                                                )}
                                            >
                                                {badge.label}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    );
}

export { PayoutHistoryCard };
