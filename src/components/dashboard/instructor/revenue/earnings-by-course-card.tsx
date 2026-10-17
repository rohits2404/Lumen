import { Card } from "@/components/ui/card";
import { CourseArt } from "@/components/dashboard/course-art";
import { formatMoney } from "@/components/dashboard/instructor/revenue/revenue-format";
import { revenueCopy } from "@/lib/config/instructor-revenue";
import type { CourseEarningRow } from "@/lib/instructor-revenue";

function EarningsByCourseCard({
    rows,
    totalCents,
}: {
    rows: CourseEarningRow[];
    totalCents: number;
}) {
    return (
        <Card className="gap-0 p-6.5 ring-border [--card-spacing:0px]">
            <h2 className="text-xl leading-none font-bold">
                {revenueCopy.byCourseHeading}
            </h2>
            <p className="mt-2.5 text-[14px] text-muted-foreground">
                {revenueCopy.byCourseLead(formatMoney(totalCents))}
            </p>

            {rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    {revenueCopy.byCourseEmpty}
                </p>
            ) : (
                <ul className="mt-5 flex flex-col gap-3.5">
                    {rows.map((row) => (
                        <li key={row.id} className="flex items-center gap-3.5">
                            <CourseArt
                                thumbnailUrl={row.thumbnailUrl}
                                categorySlug={row.categorySlug}
                                categoryAccent={row.categoryAccent}
                                className="h-7.5 w-16.5 rounded-md"
                                iconClassName="size-3.5"
                            />
                            <span className="min-w-0 flex-1 truncate text-[15px] lg:w-70 lg:flex-none">
                                {row.title}
                            </span>
                            <span className="hidden h-2.25 flex-1 overflow-hidden rounded-full bg-track lg:block">
                                <span
                                    className="block h-full rounded-full bg-primary"
                                    style={{ width: `${row.percent}%` }}
                                />
                            </span>
                            <span className="w-24 shrink-0 text-right text-[15px] font-semibold tabular-nums">
                                {formatMoney(row.cents)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

export { EarningsByCourseCard };
