import { Card } from "@/components/ui/card";
import {
    analyticsCopy,
    enrolmentSources,
} from "@/lib/config/instructor-analytics";
import type { SourceRow } from "@/lib/instructor-analytics";
import { cn } from "@/lib/utils";

function EnrolmentSourcesCard({ rows }: { rows: SourceRow[] }) {
    return (
        <Card className="gap-0 p-6 ring-border [--card-spacing:0px]">
            <h2 className="text-lg leading-none font-bold">
                {analyticsCopy.sourcesHeading}
            </h2>

            {rows.length === 0 ? (
                <p className="mt-5 text-[15px] text-muted-foreground">
                    {analyticsCopy.sourcesEmpty}
                </p>
            ) : (
                <ul className="mt-6 flex flex-col gap-4.5">
                    {rows.map((row) => {
                        const source = enrolmentSources.find(
                            (entry) => entry.value === row.source,
                        );
                        return (
                            <li key={row.source}>
                                <div className="flex items-center gap-3">
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "size-2.5 shrink-0 rounded-full",
                                            source?.dot ??
                                                "bg-muted-foreground",
                                        )}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-[15px]">
                                        {source?.label ?? row.source}
                                    </span>
                                    <span className="shrink-0 text-[15px] font-bold tabular-nums">
                                        {row.percent}%
                                    </span>
                                </div>
                                <span className="mt-2.5 block h-1.75 overflow-hidden rounded-full bg-track">
                                    <span
                                        className={cn(
                                            "block h-full rounded-full",
                                            source?.bar ??
                                                "bg-muted-foreground",
                                        )}
                                        style={{ width: `${row.percent}%` }}
                                    />
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}

export { EnrolmentSourcesCard };
