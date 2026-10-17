import { CalendarCheckIcon, CalendarClockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    instructorOverviewCards as copy,
    type InstructorOverview,
} from "@/lib/config/instructor-overview";

function OutputCard({ output }: { output: InstructorOverview["output"] }) {
    return (
        <Card className="gap-0 p-7 ring-border">
            <h2 className="text-base">{copy.output.title}</h2>

            <p className="mt-4 text-center text-[15px] text-muted-foreground">
                {copy.output.watchLabel}
            </p>
            <p className="stat-figure mt-1 text-center text-[38px] leading-none">
                {output.watchPercent}%
            </p>

            <div className="mt-5 flex items-center gap-4">
                <MiniBar value={output.publishedLessonPercent} tone="warning" />
                <MiniBar value={output.completionPercent} tone="success" />
            </div>
            <p className="mt-2.5 text-center text-[12px] text-muted-foreground">
                {copy.output.barsCaption}
            </p>

            <div className="mt-5 flex flex-col gap-3">
                <CountRow
                    icon={<CalendarClockIcon className="size-4.5" />}
                    value={output.drafts}
                    label={copy.output.drafts}
                    tone="warning"
                />
                <CountRow
                    icon={<CalendarCheckIcon className="size-4.5" />}
                    value={output.published}
                    label={copy.output.published}
                    tone="success"
                />
            </div>
        </Card>
    );
}

function MiniBar({
    value,
    tone,
}: {
    value: number;
    tone: "warning" | "success";
}) {
    return (
        <div className="flex flex-1 items-center gap-2.5">
            <Progress
                value={value}
                className={`w-full **:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-track ${
                    tone === "warning"
                        ? "**:data-[slot=progress-indicator]:bg-warning"
                        : "**:data-[slot=progress-indicator]:bg-success"
                }`}
            />
            <span className="shrink-0 text-[13px] font-semibold text-muted-foreground tabular-nums">
                {value}%
            </span>
        </div>
    );
}

function CountRow({
    icon,
    value,
    label,
    tone,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    tone: "warning" | "success";
}) {
    return (
        <div className="flex items-center gap-3.5 rounded-xl border p-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-foreground text-background">
                {icon}
            </span>
            <span className="flex-1 text-[22px] font-extrabold tabular-nums">
                {value}
            </span>
            <Badge
                className={`h-8 px-4 text-[13px] font-semibold text-white ${
                    tone === "warning" ? "bg-warning" : "bg-success"
                }`}
            >
                {label}
            </Badge>
        </div>
    );
}

export { OutputCard };
