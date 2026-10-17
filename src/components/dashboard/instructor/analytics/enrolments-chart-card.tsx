"use client";

import { Bar, BarChart, LabelList, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatDelta } from "@/components/dashboard/stat-format";
import { analyticsCopy } from "@/lib/config/instructor-analytics";
import type { EnrolmentSeries } from "@/lib/instructor-analytics";

const chartConfig = {
    count: { label: "New enrolments", color: "var(--bar-fill)" },
} satisfies ChartConfig;

const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
});

const counts = new Intl.NumberFormat("en-US");

function EnrolmentsChartCard({ series }: { series: EnrolmentSeries }) {
    const delta = formatDelta(series.delta);
    const empty = series.months.every((month) => month.count === 0);

    const data = series.months.map((month) => ({
        label: monthLabel.format(month.month),
        count: month.count,
    }));

    return (
        <Card className="gap-0 px-6 ring-border [--card-spacing:--spacing(6)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg leading-none font-bold">
                        {analyticsCopy.enrolmentsHeading}
                    </h2>
                    <p className="mt-2.5 text-[14px] text-muted-foreground">
                        {analyticsCopy.enrolmentsLead(
                            series.total,
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
                    {analyticsCopy.enrolmentsEmpty}
                </p>
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className="mt-7 aspect-auto h-62 w-full"
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
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={6}
                            maxBarSize={46}
                        >
                            <LabelList
                                dataKey="count"
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={13}
                                fontWeight={500}
                                formatter={(value) =>
                                    counts.format(Number(value ?? 0))
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </Card>
    );
}

export { EnrolmentsChartCard };
