import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CourseArt } from "@/components/dashboard/course-art";
import { formatStatValue } from "@/components/dashboard/stat-format";
import { analyticsCopy } from "@/lib/config/instructor-analytics";
import type { CoursePerformanceRow } from "@/lib/instructor-analytics";

const counts = new Intl.NumberFormat("en-US");

function CoursePerformanceCard({ rows }: { rows: CoursePerformanceRow[] }) {
    return (
        <Card className="gap-0 overflow-hidden px-7 py-6 ring-border [--card-spacing:0px]">
            <h2 className="text-xl leading-none font-bold">
                {analyticsCopy.performanceHeading}
            </h2>
            <p className="mt-2.5 text-[14px] text-muted-foreground">
                {analyticsCopy.performanceLead}
            </p>

            {rows.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    {analyticsCopy.performanceEmpty}
                </p>
            ) : (
                <div className="mt-4 overflow-x-auto">
                    <Table className="min-w-170 border-b border-border-subtle">
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="h-9.5 w-[44%] px-0 text-[14px] font-normal text-muted-foreground">
                                    {analyticsCopy.columns.course}
                                </TableHead>
                                <TableHead className="h-9.5 px-0 text-[14px] font-normal text-muted-foreground">
                                    {analyticsCopy.columns.enrolments}
                                </TableHead>
                                <TableHead className="h-9.5 px-0 text-[14px] font-normal text-muted-foreground">
                                    {analyticsCopy.columns.completion}
                                </TableHead>
                                <TableHead className="h-9.5 px-0 text-[14px] font-normal text-muted-foreground">
                                    {analyticsCopy.columns.watchTime}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-border-subtle hover:bg-transparent"
                                >
                                    <TableCell className="h-13.75 px-0">
                                        <div className="flex items-center gap-3">
                                            <CourseArt
                                                thumbnailUrl={row.thumbnailUrl}
                                                categorySlug={row.categorySlug}
                                                categoryAccent={
                                                    row.categoryAccent
                                                }
                                                className="h-7 w-10 rounded-md"
                                                iconClassName="size-3"
                                            />
                                            <span className="min-w-0 truncate text-[15px] font-semibold">
                                                {row.title}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="h-13.75 px-0 text-[15px] font-semibold tabular-nums">
                                        {counts.format(row.enrolments)}
                                    </TableCell>
                                    <TableCell className="h-13.75 px-0 text-[15px] text-muted-foreground tabular-nums">
                                        {formatStatValue(
                                            row.completion,
                                            "percent1",
                                        )}
                                    </TableCell>
                                    <TableCell className="h-13.75 px-0 text-[15px] text-muted-foreground tabular-nums">
                                        {formatStatValue(
                                            row.watchTime,
                                            "percent1",
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    );
}

export { CoursePerformanceCard };
