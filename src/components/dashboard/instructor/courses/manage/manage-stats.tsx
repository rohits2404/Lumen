import { ManageCoursePage } from "@/lib/instructor-course-manage";
import { manageStatLabels } from "@/lib/config/instructor-course-manage";
import {
    BookOpenTextIcon,
    LucideIcon,
    ReceiptTextIcon,
    StarIcon,
    UsersRoundIcon,
} from "lucide-react";
import { formatCount, formatMoneyWhole, formatRating } from "../courses-format";
import { Card } from "@/components/ui/card";

function ManageStats({ stats }: { stats: ManageCoursePage["stats"] }) {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
                icon={UsersRoundIcon}
                label={manageStatLabels.students}
                value={formatCount(stats.students)}
            />
            <MetricTile
                icon={StarIcon}
                label={manageStatLabels.rating}
                value={stats.rating === null ? "—" : formatRating(stats.rating)}
            />
            <MetricTile
                icon={ReceiptTextIcon}
                label={manageStatLabels.revenue}
                value={formatMoneyWhole(stats.revenueCents)}
            />
            <MetricTile
                icon={BookOpenTextIcon}
                label={manageStatLabels.lessons}
                value={formatCount(stats.lessons)}
            />
        </div>
    );
}

function MetricTile({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <Card className="gap-1.5 p-4 ring-border">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4 shrink-0" />
                <span className="text-sm leading-4">{label}</span>
            </div>
            <p className="text-2xl leading-none font-extrabold tracking-[-0.02em] tabular-nums">
                {value}
            </p>
        </Card>
    );
}

export { ManageStats };
