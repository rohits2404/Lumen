import { CompletionCard } from "./completion-card";
import { OutputCard } from "./output-card";
import { ProductionCard } from "./production-card";
import { RevenueCard } from "./revenue-card";
import { SpendCard } from "./spend-card";
import { TopCoursesCard } from "./top-courses-card";
import { WelcomeCard } from "./welcome-card";
import type { InstructorOverview as Data } from "@/lib/config/instructor-overview";

function InstructorOverview({ data }: { data: Data }) {
    return (
        <div className="flex flex-col gap-5.5">
            <div className="grid gap-5.5 lg:grid-cols-2">
                <WelcomeCard
                    firstName={data.firstName}
                    learners={data.learnersThisMonth}
                />
                <ProductionCard courses={data.production} />
            </div>

            <div className="grid gap-5.5 md:grid-cols-2 xl:grid-cols-3">
                <CompletionCard completion={data.completion} />
                <OutputCard output={data.output} />
                <SpendCard spend={data.spend} />
            </div>

            <div className="grid gap-5.5 xl:grid-cols-[1.12fr_1fr]">
                <RevenueCard
                    revenue={data.revenue}
                    deltaPercent={data.revenueDeltaPercent}
                />
                <TopCoursesCard courses={data.topCourses} />
            </div>
        </div>
    );
}

export { InstructorOverview };
