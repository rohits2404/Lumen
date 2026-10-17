import { StarIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Stars } from "./stars";
import { reviewsCopy } from "@/lib/config/instructor-reviews";
import type { ReviewsSummary } from "@/lib/instructor-reviews";

function RatingSummaryCard({ summary }: { summary: ReviewsSummary }) {
    return (
        <Card className="justify-center p-6 ring-border [--card-spacing:0px]">
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex w-27 shrink-0 flex-col items-center">
                    <p className="stat-figure text-[52px]">
                        {summary.rating === null
                            ? "—"
                            : summary.rating.toFixed(1)}
                    </p>
                    <div className="mt-3">
                        <Stars
                            rating={summary.rating ?? 0}
                            className="size-3.5"
                            gapClassName="gap-[5px]"
                        />
                    </div>
                    {summary.trend === null ? null : (
                        <p
                            className={
                                summary.trend < 0
                                    ? "mt-2.5 text-[14px] font-semibold text-destructive"
                                    : "mt-2.5 text-[14px] font-semibold text-success"
                            }
                        >
                            {reviewsCopy.trend(summary.trend)}
                        </p>
                    )}
                </div>

                <div className="min-w-70 flex-1">
                    <p className="text-[15px] text-muted-foreground">
                        {reviewsCopy.summary(summary.total, summary.courses)}
                    </p>

                    <div className="mt-3.5 flex flex-col gap-1.75">
                        {summary.breakdown.map((row) => (
                            <div
                                key={row.stars}
                                className="flex items-center gap-3 text-[13px] leading-3.75 text-muted-foreground"
                            >
                                <span className="w-2 shrink-0 text-right tabular-nums">
                                    {row.stars}
                                </span>
                                <StarIcon className="size-3 shrink-0 fill-star text-star" />
                                <span className="h-1.75 flex-1 overflow-hidden rounded-full bg-track">
                                    <span
                                        className="block h-full rounded-full bg-star"
                                        style={{ width: `${row.percent}%` }}
                                    />
                                </span>
                                <span className="w-12 shrink-0 text-right tabular-nums">
                                    {row.count.toLocaleString("en-US")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export { RatingSummaryCard };
