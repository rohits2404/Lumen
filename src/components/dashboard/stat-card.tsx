import type { LucideIcon } from "lucide-react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
    deltaToneClass,
    formatCountDelta,
    formatDelta,
    formatStatValue,
    type StatFormat,
} from "@/components/dashboard/stat-format";
import { cn } from "@/lib/utils";

function StatCard({
    label,
    icon: Icon,
    value,
    delta,
    format,
    arrow = false,
    deltaFormat = "percent",
    footnote,
}: {
    label: string;
    icon: LucideIcon;
    value: number | null;
    delta: number | null;
    format: StatFormat;
    arrow?: boolean;
    deltaFormat?: "percent" | "count";
    footnote?: string;
}) {
    const formatted =
        deltaFormat === "count" ? formatCountDelta(delta) : formatDelta(delta);
    const Arrow = delta !== null && delta < 0 ? ArrowDownIcon : ArrowUpIcon;

    return (
        <Card className="px-5 ring-border [--card-spacing:--spacing(5)]">
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                    <div className="grid size-8.5 shrink-0 place-items-center rounded-xl bg-hover">
                        <Icon className="size-4.5" />
                    </div>
                    <span className="text-[15px] text-muted-foreground">
                        {label}
                    </span>
                </div>

                <div className="flex items-baseline gap-2.5">
                    <span className="text-[32px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">
                        {formatStatValue(value, format)}
                    </span>
                    {formatted ? (
                        <span
                            className={cn(
                                "flex items-center gap-1 text-[15px] font-semibold tabular-nums",
                                deltaToneClass(delta),
                            )}
                        >
                            {arrow ? (
                                <Arrow
                                    aria-hidden
                                    className="size-3.5 stroke-[2.5]"
                                />
                            ) : null}
                            {formatted}
                        </span>
                    ) : null}
                </div>

                {footnote ? (
                    <p className="-mt-1.5 text-[14px] text-muted-foreground">
                        {footnote}
                    </p>
                ) : null}
            </div>
        </Card>
    );
}

export { StatCard };
