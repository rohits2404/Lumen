import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ChevronRightIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { SubtitleFormatters } from "@/lib/config/admin-overview";

const subtitleFormatters: SubtitleFormatters = {
    relative: (date) => formatDistanceToNowStrict(date, { addSuffix: true }),
    shortDate: (date) => format(date, "dd MMM"),
};
import {
    adminOverviewCopy,
    attentionQueues,
    attentionToneClasses,
} from "@/lib/config/admin-overview";
import type { AttentionFacts } from "@/lib/admin/overview";
import { cn } from "@/lib/utils";

function AttentionList({ facts }: { facts: AttentionFacts }) {
    const rows = attentionQueues
        .map((queue) => ({
            queue,
            ...queue.describe(facts, subtitleFormatters),
        }))
        .filter((row) => row.count > 0);

    if (rows.length === 0) {
        return (
            <Card className="px-5 ring-border [--card-spacing:--spacing(5)]">
                <p className="text-[15px] text-muted-foreground">
                    {adminOverviewCopy.attentionEmpty}
                </p>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {rows.map(({ queue, title, subtitle }) => {
                const row = (
                    <>
                        <div
                            className={cn(
                                "grid size-10 shrink-0 place-items-center rounded-xl",
                                attentionToneClasses[queue.tone],
                            )}
                        >
                            <queue.icon className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-bold">
                                {title}
                            </p>
                            {subtitle ? (
                                <p className="truncate text-[15px] text-muted-foreground">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>

                        {queue.built ? (
                            <ChevronRightIcon className="size-4.5 shrink-0 text-muted-foreground" />
                        ) : null}
                    </>
                );

                return (
                    <Card
                        key={queue.key}
                        className={cn(
                            "px-4.5 ring-border [--card-spacing:--spacing(4.5)]",
                            queue.built &&
                                "transition-shadow hover:shadow-card",
                        )}
                    >
                        {queue.built ? (
                            <Link
                                href={queue.href}
                                className="flex items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {row}
                            </Link>
                        ) : (
                            <div
                                aria-disabled="true"
                                className="flex items-center gap-4"
                            >
                                {row}
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}

export { AttentionList };
