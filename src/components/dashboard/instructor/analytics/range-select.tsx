"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ANALYTICS_DEFAULT_RANGE,
    analyticsCopy,
    analyticsRanges,
    type AnalyticsRange,
} from "@/lib/config/instructor-analytics";
import { cn } from "@/lib/utils";

function RangeSelect({ value }: { value: AnalyticsRange }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = React.useTransition();

    function change(next: AnalyticsRange) {
        const params = new URLSearchParams(searchParams);
        if (next === ANALYTICS_DEFAULT_RANGE) params.delete("range");
        else params.set("range", next);
        const query = params.toString();
        startTransition(() => {
            router.replace(query ? `${pathname}?${query}` : pathname, {
                scroll: false,
            });
        });
    }

    return (
        <Select
            value={value}
            onValueChange={(next: string | null) => {
                if (next) change(next as AnalyticsRange);
            }}
        >
            <SelectTrigger
                aria-label={analyticsCopy.rangeLabel}
                className={cn(
                    "h-10.5 w-38.75 gap-2 rounded-lg bg-card shadow-sm",
                    "data-[size=default]:h-10.5",
                )}
            >
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue>
                    {(current: string) =>
                        analyticsRanges.find((range) => range.value === current)
                            ?.label ?? analyticsRanges[1]!.label
                    }
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
                {analyticsRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                        {range.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export { RangeSelect };
