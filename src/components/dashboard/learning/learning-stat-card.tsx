import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

function LearningStatCard({
    icon: Icon,
    value,
    label,
}: {
    icon: LucideIcon;
    value: string;
    label: string;
}) {
    return (
        <Card className="flex-row items-center gap-4 p-5 ring-border">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-hover">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-2xl leading-7 font-extrabold tracking-[-0.02em] tabular-nums">
                    {value}
                </p>
                <p className="text-sm leading-4 text-muted-foreground">
                    {label}
                </p>
            </div>
        </Card>
    );
}

export { LearningStatCard };
