"use client";

import { Bar, BarChart, LabelList, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
    formatMoney,
    formatMoneyCompact,
} from "@/components/dashboard/instructor/revenue/revenue-format";
import { formatDelta } from "@/components/dashboard/stat-format";
import { revenueCopy } from "@/lib/config/instructor-revenue";
import type { EarningSeries } from "@/lib/instructor-revenue";

const chartConfig = {
    cents: { label: "Earnings", color: "var(--bar-fill)" },
} satisfies ChartConfig;

const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
});

function EarningsChartCard({ series }: { series: EarningSeries }) {
    const delta = formatDelta(series.delta);
    const empty = series.months.every((month) => month.cents === 0);

    const data = series.months.map((month) => ({
        label: monthLabel.format(month.month),
        cents: month.cents,
    }));

    return (
        <Card className="gap-0 p-6.5 ring-border [--card-spacing:0px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg leading-none font-bold">
                        {revenueCopy.earningsHeading}
                    </h2>
                    <p className="mt-2.5 text-[14px] text-muted-foreground">
                        {revenueCopy.earningsLead(
                            formatMoney(series.totalCents),
                            series.bestMonth,
                        )}
                    </p>
                </div>
                {delta ? (
                    <Badge className="h-6.5 shrink-0 bg-foreground px-2.5 text-[13px] font-semibold text-background tabular-nums">
                        {delta}
                    </Badge>
                ) : null}
            </div>

            {empty ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                    {revenueCopy.earningsEmpty}
                </p>
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className="mt-7 aspect-auto h-51.5 w-full"
                >
                    <BarChart
                        data={data}
                        margin={{ top: 26, left: 0, right: 0 }}
                    >
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={14}
                            tick={{
                                fill: "var(--color-muted-foreground)",
                                fontSize: 13,
                            }}
                        />
                        <Bar
                            dataKey="cents"
                            fill="var(--color-cents)"
                            radius={6}
                            maxBarSize={46}
                        >
                            <LabelList
                                dataKey="cents"
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={13}
                                fontWeight={500}
                                formatter={(value) =>
                                    formatMoneyCompact(Number(value ?? 0))
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </Card>
    );
}

export { EarningsChartCard };
