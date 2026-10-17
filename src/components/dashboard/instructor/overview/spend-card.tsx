"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
    instructorOverviewCards as copy,
    type SpendSlice,
} from "@/lib/config/instructor-overview";

function SpendCard({ spend }: { spend: SpendSlice[] }) {
    const chartConfig: ChartConfig = Object.fromEntries(
        spend.map((slice) => [
            slice.label,
            { label: slice.label, color: slice.color },
        ]),
    ) satisfies ChartConfig;

    return (
        <Card className="gap-0 p-7 ring-border">
            <h2 className="text-base">{copy.spend.title}</h2>

            {spend.length === 0 ? (
                <div className="mt-6 grid flex-1 place-items-center rounded-xl border border-dashed px-5 py-10 text-center">
                    <p className="max-w-75 text-[13px] leading-5 text-muted-foreground">
                        {copy.spend.emptyBody}
                    </p>
                </div>
            ) : (
                <>
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto mt-4 h-57.5 w-57.5"
                    >
                        <PieChart>
                            <Pie
                                data={spend}
                                dataKey="value"
                                nameKey="label"
                                innerRadius={68}
                                outerRadius={112}
                                paddingAngle={0}
                                strokeWidth={0}
                                startAngle={90}
                                endAngle={-270}
                            >
                                {spend.map((slice) => (
                                    <Cell
                                        key={slice.label}
                                        fill={slice.color}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                        {spend.map((slice) => (
                            <div key={slice.label} className="text-center">
                                <p className="flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
                                    <span
                                        aria-hidden
                                        className="size-1.5 rounded-full"
                                        style={{ background: slice.color }}
                                    />
                                    {slice.label}
                                </p>
                                <p className="mt-1 text-[17px] font-bold tabular-nums">
                                    {slice.value}%
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Card>
    );
}

export { SpendCard };
