import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    compactMoney,
    discountLabel,
    formatCount,
    scopeLabel,
} from "@/components/dashboard/admin/promotions/promotions-format";
import { adminPromotionsCopy } from "@/lib/config/admin-promotions";
import type { PastPromotion } from "@/lib/admin/promotions";

function PastPromotionsTable({ rows }: { rows: PastPromotion[] }) {
    const columns = adminPromotionsCopy.pastColumns;

    return (
        <>
            <h2 className="mt-7 text-xl font-bold">
                {adminPromotionsCopy.pastHeading}
            </h2>

            {rows.length === 0 ? (
                <Card className="mt-3 items-center gap-3 px-6 py-16 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminPromotionsCopy.pastEmptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminPromotionsCopy.pastEmptyDescription}
                    </p>
                </Card>
            ) : (
                <Card className="mt-3 overflow-hidden ring-border [--card-spacing:0px]">
                    <Table className="border-b">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="h-10.75 w-[25.5%] px-5 text-[13px] font-medium text-muted-foreground">
                                    {columns.promotion}
                                </TableHead>
                                <TableHead className="h-10.75 w-[17.5%] px-5 text-[13px] font-medium text-muted-foreground">
                                    {columns.discount}
                                </TableHead>
                                <TableHead className="h-10.75 w-[20.5%] px-5 text-[13px] font-medium text-muted-foreground">
                                    {columns.scope}
                                </TableHead>
                                <TableHead className="h-10.75 w-[17.5%] px-5 text-[13px] font-medium text-muted-foreground">
                                    {columns.redemptions}
                                </TableHead>
                                <TableHead className="h-10.75 w-[19%] px-5 text-[13px] font-medium text-muted-foreground">
                                    {columns.revenue}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-border-subtle hover:bg-transparent"
                                >
                                    <TableCell className="h-11.25 px-5 text-[15px] font-semibold">
                                        {row.name}
                                    </TableCell>
                                    <TableCell className="h-11.25 px-5 text-[15px] text-muted-foreground">
                                        {discountLabel(
                                            row.discountType,
                                            row.value,
                                        )}
                                    </TableCell>
                                    <TableCell className="h-11.25 px-5 text-[15px] text-muted-foreground">
                                        {scopeLabel(
                                            row.scope,
                                            row.categoryNames,
                                        )}
                                    </TableCell>
                                    <TableCell className="h-11.25 px-5 text-[15px] text-muted-foreground tabular-nums">
                                        {formatCount(row.redemptionCount)}
                                    </TableCell>
                                    <TableCell className="h-11.25 px-5 text-[15px] font-bold tabular-nums">
                                        {compactMoney(row.revenueCents)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </>
    );
}

export { PastPromotionsTable };
