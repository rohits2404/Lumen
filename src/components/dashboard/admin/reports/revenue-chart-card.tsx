"use client";

import { Bar, BarChart, LabelList, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatDelta } from "@/components/dashboard/stat-format";
import { adminReportsCopy } from "@/lib/config/admin-reports";
import type { RevenueSeries } from "@/lib/admin/reports";

const chartConfig = {
    cents: { label: "Gross revenue", color: "var(--bar-fill)" },
} satisfies ChartConfig;

const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
});

const compact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
});

function compactMoney(cents: number) {
    return compact.format(cents / 100).replace(/K$/, "k");
}

function RevenueChartCard({ series }: { series: RevenueSeries }) {
    const delta = formatDelta(series.delta);
    const empty = series.months.every((month) => month.cents === 0);

    const data = series.months.map((month) => ({
        label: monthLabel.format(month.month),
        cents: month.cents,
    }));

    return (
        <Card className="gap-0 px-6 ring-border [--card-spacing:--spacing(6)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-[17px] leading-none font-bold">
                        {adminReportsCopy.revenueHeading}
                    </h2>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                        Total {compactMoney(series.totalCents)} across the
                        period
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
                    {adminReportsCopy.revenueEmpty}
                </p>
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className="mt-8 aspect-auto h-62 w-full"
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
                            maxBarSize={56}
                        >
                            <LabelList
                                dataKey="cents"
                                position="top"
                                offset={14}
                                className="fill-foreground"
                                fontSize={13}
                                fontWeight={500}
                                formatter={(value) =>
                                    compactMoney(Number(value ?? 0))
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </Card>
    );
}

export { RevenueChartCard };
