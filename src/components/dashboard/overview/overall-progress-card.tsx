import Link from "next/link";
import { ArrowUpIcon, BadgeCheckIcon, BookOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { OverviewData } from "@/lib/config/dashboard-overview-shape";

function OverallProgressCard({ p }: { p: OverviewData["overall"] }) {
    const completedPercent = Math.round(
        (p.coursesCompleted / p.coursesEnrolled) * 100,
    );

    return (
        <Card className="gap-0 p-6.5 ring-border">
            <h2 className="text-base">Your Overall Progress</h2>

            <div className="mt-4 flex items-baseline gap-2.5">
                <span className="stat-figure text-5xl">{p.percent}%</span>
                <span className="flex items-center gap-0.5 text-sm font-semibold text-success">
                    <ArrowUpIcon className="size-3.5" />
                    {p.deltaPercent}%
                </span>
            </div>
            <Progress
                value={p.percent}
                className="mt-4 **:data-[slot=progress-indicator]:bg-bar-fill **:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-track"
            />

            <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-sm">
                    <BookOpenIcon className="size-4 text-accent-2" />
                    <span className="flex-1">Courses Enrolled</span>
                    <span className="font-bold tabular-nums">
                        {p.coursesEnrolled}
                    </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <BadgeCheckIcon className="size-4 text-success" />
                    <span className="flex-1">Courses Completed</span>
                    <span className="font-bold tabular-nums">
                        {p.coursesCompleted}
                    </span>
                </div>
            </div>

            <Progress
                value={completedPercent}
                className="mt-3 **:data-[slot=progress-indicator]:bg-bar-fill **:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-track"
            />
            <p className="mt-2 text-[13px] text-muted-foreground">
                {completedPercent}% Completed
            </p>

            <Button
                variant="outline"
                nativeButton={false}
                className="mt-5 h-11 w-full bg-card font-semibold"
                render={<Link href="/dashboard/learning" />}
            >
                View My Courses
            </Button>
        </Card>
    );
}

export { OverallProgressCard };
