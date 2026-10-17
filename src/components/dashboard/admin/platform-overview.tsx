import { Badge } from "@/components/ui/badge";
import {
    getAttentionFacts,
    getPlatformStats,
    getTopCourses,
} from "@/lib/admin/overview";
import { adminOverviewCopy } from "@/lib/config/admin-overview";
import { PlatformStatsRow } from "./platform-stats";
import { AttentionList } from "./attention-list";
import { TopCoursesCard } from "./top-courses-card";

async function PlatformOverview() {
    const [stats, attention, topCourses] = await Promise.all([
        getPlatformStats(),
        getAttentionFacts(),
        getTopCourses(),
    ]);

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <div className="flex items-center gap-3">
                <h1 className="text-[32px] leading-none font-bold">
                    {adminOverviewCopy.title}
                </h1>
                <Badge
                    variant="outline"
                    className="h-6.5 gap-2 border-border bg-transparent px-3 font-medium text-foreground"
                >
                    <span className="size-1.5 rounded-full bg-role-admin" />
                    {adminOverviewCopy.modeBadge}
                </Badge>
            </div>

            <div className="mt-6">
                <PlatformStatsRow stats={stats} />
            </div>

            <h2 className="mt-8 mb-4 text-xl leading-none font-bold">
                {adminOverviewCopy.attentionHeading}
            </h2>
            <AttentionList facts={attention} />

            <h2 className="mt-8 mb-4 text-xl leading-none font-bold">
                {adminOverviewCopy.topCoursesHeading}
            </h2>
            <TopCoursesCard courses={topCourses} />
        </main>
    );
}

export { PlatformOverview };
