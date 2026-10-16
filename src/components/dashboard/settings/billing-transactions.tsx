import { ReceiptTextIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { BillingTransaction } from "@/lib/billing";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BillingTransaction["status"], string> = {
    PAID: "bg-success/10 text-success",
    PENDING: "bg-warning/10 text-warning",
    FAILED: "bg-destructive/10 text-destructive",
    EXPIRED: "bg-muted text-muted-foreground",
    REFUNDED: "bg-info/10 text-info",
};

function money(cents: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function BillingTransactions({
    transactions,
}: {
    transactions: BillingTransaction[];
}) {
    return (
        <section>
            <h2 className="text-[17px] leading-snug font-bold">
                Transaction History
            </h2>

            {transactions.length === 0 ? (
                <Empty className="mt-2 border border-dashed">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ReceiptTextIcon />
                        </EmptyMedia>
                        <EmptyTitle>No Transactions Yet</EmptyTitle>
                        <EmptyDescription>
                            Course Purchases Show Up Here As Soon As You Buy
                            One.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Table className="mt-2 border-b border-border-subtle">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-10 w-37 px-1 text-[13px] font-normal text-muted-foreground">
                                Reference
                            </TableHead>
                            <TableHead className="h-10 w-76.75 px-1 text-[13px] font-normal text-muted-foreground">
                                Product
                            </TableHead>
                            <TableHead className="h-10 w-36.75 px-1 text-[13px] font-normal text-muted-foreground">
                                Status
                            </TableHead>
                            <TableHead className="h-10 w-35 px-1 text-[13px] font-normal text-muted-foreground">
                                Date
                            </TableHead>
                            <TableHead className="h-10 px-1 text-right text-[13px] font-normal text-muted-foreground">
                                Amount
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.id}
                                className="border-border-subtle hover:bg-transparent"
                            >
                                <TableCell className="h-12.5 px-1 text-muted-foreground">
                                    {transaction.reference}
                                </TableCell>
                                <TableCell className="h-12.5 max-w-76.75 truncate px-1 font-medium">
                                    {transaction.product}
                                </TableCell>
                                <TableCell className="h-12.5 px-1">
                                    <Badge
                                        className={cn(
                                            "px-2.5",
                                            STATUS_STYLES[transaction.status],
                                        )}
                                    >
                                        {transaction.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="h-12.5 px-1 text-muted-foreground">
                                    {transaction.date.toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric",
                                        },
                                    )}
                                </TableCell>
                                <TableCell className="h-12.5 px-1 text-right font-semibold">
                                    {money(
                                        transaction.amountCents,
                                        transaction.currency,
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}

export { BillingTransactions };
