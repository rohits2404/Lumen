import { analyticsCopy } from "@/lib/config/instructor-analytics";
import type { AnalyticsPage as AnalyticsPageData } from "@/lib/instructor-analytics";
import { RangeSelect } from "./range-select";
import { AnalyticsStats } from "./analytics-stats";
import { EnrolmentsChartCard } from "./enrolments-chart-card";
import { EnrolmentSourcesCard } from "./enrolment-sources-card";
import { CoursePerformanceCard } from "./course-performance-card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { BarChart3Icon } from "lucide-react";

function Analytics({ page }: { page: AnalyticsPageData }) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[32px] leading-none font-bold">
                        {analyticsCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {analyticsCopy.description}
                    </p>
                </div>
                <RangeSelect value={page.range} />
            </div>

            {page.hasCourses ? (
                <>
                    <AnalyticsStats stats={page.stats} />

                    <div className="mt-5 grid items-start gap-5 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <EnrolmentsChartCard series={page.series} />
                        </div>
                        <div className="lg:col-span-2">
                            <EnrolmentSourcesCard rows={page.sources} />
                        </div>
                    </div>

                    <div className="mt-5">
                        <CoursePerformanceCard rows={page.courses} />
                    </div>
                </>
            ) : (
                <Empty className="mt-6 rounded-xl bg-card py-16 ring-1 ring-border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BarChart3Icon />
                        </EmptyMedia>
                        <EmptyTitle>{analyticsCopy.empty.title}</EmptyTitle>
                        <EmptyDescription>
                            {analyticsCopy.empty.description}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </main>
    );
}

export { Analytics };
