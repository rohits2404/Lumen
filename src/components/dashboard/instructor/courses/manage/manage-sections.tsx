import { Card } from "@/components/ui/card";
import {
    manageGroups,
    ManageRow,
    manageRowHref,
    ManageRowTarget,
} from "@/lib/config/instructor-course-manage";
import { ManageFacts } from "@/lib/types/instructor-course-manage";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

function ManageSections({
    facts,
    course,
    builtRows,
}: {
    facts: ManageFacts;
    course: ManageRowTarget;
    builtRows: Set<string>;
}) {
    return (
        <div>
            {manageGroups.map((group) => (
                <section key={group.title} className="mt-5 first:mt-0">
                    <h3 className="text-[13px] leading-none font-medium tracking-[0.06em] text-subtle-foreground uppercase">
                        {group.title}
                    </h3>
                    <Card className="mt-2.5 overflow-hidden p-0 ring-border [--card-spacing:0px]">
                        {group.rows.map((row, index) => (
                            <ManageRowItem
                                key={row.key}
                                row={row}
                                facts={facts}
                                href={
                                    builtRows.has(row.key)
                                        ? manageRowHref[row.key]?.(course)
                                        : undefined
                                }
                                first={index === 0}
                            />
                        ))}
                    </Card>
                </section>
            ))}
        </div>
    );
}

function ManageRowItem({
    row,
    facts,
    href,
    first,
}: {
    row: ManageRow;
    facts: ManageFacts;
    href?: string;
    first: boolean;
}) {
    const Icon = row.icon;
    const badge = row.badge?.(facts) ?? null;

    const body = (
        <>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-hover">
                <Icon className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-semibold">
                    {row.title}
                </span>
                <span className="mt-1 block truncate text-[13px] text-muted-foreground">
                    {row.detail(facts)}
                </span>
            </span>
            {badge ? (
                <span className="inline-flex h-5.5 shrink-0 items-center rounded-full bg-hover px-2.5 text-[13px] text-muted-foreground tabular-nums">
                    {badge}
                </span>
            ) : null}
            {href ? (
                <ChevronRightIcon className="size-4 shrink-0 text-subtle-foreground" />
            ) : null}
        </>
    );

    const shared = cn(
        "flex h-16 items-center gap-3.5 px-4",
        !first && "border-t border-border-subtle",
    );

    if (!href) {
        return <div className={shared}>{body}</div>;
    }

    return (
        <Link
            href={href}
            className={cn(shared, "transition-colors hover:bg-hover/60")}
        >
            {body}
        </Link>
    );
}

export { ManageSections };
