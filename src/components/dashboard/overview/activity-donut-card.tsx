"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { ActivitySlice } from "@/lib/config/dashboard-overview-shape";

function ActivityDonutCard({
    activityBreakdown,
}: {
    activityBreakdown: ActivitySlice[];
}) {
    const chartConfig: ChartConfig = Object.fromEntries(
        activityBreakdown.map((slice) => [
            slice.label,
            { label: slice.label, color: slice.color },
        ]),
    ) satisfies ChartConfig;

    return (
        <Card className="gap-0 p-6.5 ring-border">
            <h2 className="text-base">Most Activity</h2>

            <ChartContainer
                config={chartConfig}
                className="mx-auto mt-2 h-55 w-55"
            >
                <PieChart>
                    <Pie
                        data={activityBreakdown}
                        dataKey="value"
                        nameKey="label"
                        innerRadius="66%"
                        outerRadius="100%"
                        strokeWidth={0}
                    >
                        {activityBreakdown.map((slice) => (
                            <Cell key={slice.label} fill={slice.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {activityBreakdown.map((slice) => (
                    <div
                        key={slice.label}
                        className="flex flex-col items-center gap-1.5"
                    >
                        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                            <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: slice.color }}
                            />
                            {slice.label}
                        </span>
                        <span className="text-base font-bold tabular-nums">
                            {slice.value}%
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export { ActivityDonutCard };
