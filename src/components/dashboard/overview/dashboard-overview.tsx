import { OverviewData } from "@/lib/config/dashboard-overview-shape";
import { WelcomeCard } from "./welcome-card";
import { LearningPathCard } from "./learning-path-card";
import { OverallProgressCard } from "./overall-progress-card";
import { ProgressStatisticsCard } from "./progress-statistics-card";
import { ActivityDonutCard } from "./activity-donut-card";
import { ProgressChartCard } from "./progress-chart-card";
import { ContinueLearningCard } from "./continue-learning-card";

function DashboardOverview({
    firstName,
    data,
}: {
    firstName: string;
    data: OverviewData;
}) {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
                <WelcomeCard firstName={firstName} />
                <LearningPathCard learningPaths={data.learningPaths} />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <OverallProgressCard p={data.overall} />
                <ProgressStatisticsCard p={data.overall} />
                <ActivityDonutCard activityBreakdown={data.activity} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
                <ProgressChartCard monthlyProgress={data.weekly} />
                <ContinueLearningCard courses={data.continueLearning} />
            </div>
        </div>
    );
}

export { DashboardOverview };
