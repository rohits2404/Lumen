import {
    ClockIcon,
    MessageCircleIcon,
    MessagesSquareIcon,
    UsersIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
    discussionStatAccents,
    discussionStatLabels,
} from "@/lib/config/discussions";
import type { DiscussionStats } from "@/lib/discussions";
import { cn } from "@/lib/utils";

function DiscussionStatsRow({ stats }: { stats: DiscussionStats }) {
    const tiles = [
        {
            icon: MessagesSquareIcon,
            value: stats.activeThreads,
            label: discussionStatLabels.activeThreads,
        },
        {
            icon: MessageCircleIcon,
            value: stats.repliesThisMonth,
            label: discussionStatLabels.repliesThisMonth,
        },
        {
            icon: ClockIcon,
            value: stats.awaitingReply,
            label: discussionStatLabels.awaitingReply,
        },
        {
            icon: UsersIcon,
            value: stats.participants,
            label: discussionStatLabels.participants,
        },
    ];

    return (
        <>
            {tiles.map((tile, index) => (
                <Card
                    key={tile.label}
                    className="flex-row items-center gap-3.5 p-4.5 py-4 ring-border"
                >
                    <div
                        className={cn(
                            "grid size-9.5 shrink-0 place-items-center rounded-lg",
                            discussionStatAccents[index],
                        )}
                    >
                        <tile.icon className="size-4.5" />
                    </div>
                    <div>
                        <p className="text-[22px] leading-7 font-extrabold tracking-[-0.02em] tabular-nums">
                            {new Intl.NumberFormat("en-US").format(tile.value)}
                        </p>
                        <p className="text-[13px] leading-4 text-muted-foreground">
                            {tile.label}
                        </p>
                    </div>
                </Card>
            ))}
        </>
    );
}

export { DiscussionStatsRow };
