import { Card } from "@/components/ui/card";
import { ManageCoursePage } from "@/lib/instructor-course-manage";
import {
    healthMetrics,
    manageCourseCopy,
} from "@/lib/config/instructor-course-manage";
import { cn } from "@/lib/utils";

function CourseHealthCard({
    health,
    hasQuizzes,
}: {
    health: ManageCoursePage["health"];
    hasQuizzes: boolean;
}) {
    const metrics = healthMetrics.filter(
        (metric) => metric.key !== "quizPass" || hasQuizzes,
    );

    return (
        <Card className="p-5 ring-border [--card-spacing:0px]">
            <h2 className="text-[16px] leading-none font-bold">
                {manageCourseCopy.healthHeading}
            </h2>

            <div className="mt-4 space-y-3.5">
                {metrics.map((metric) => {
                    const value = health[metric.key];

                    return (
                        <div key={metric.key}>
                            <div className="flex items-baseline justify-between gap-3 text-[15px] leading-5">
                                <span className="min-w-0 truncate text-muted-foreground">
                                    {metric.label}
                                </span>
                                {value === null ? (
                                    <span className="shrink-0 text-[13px] text-subtle-foreground">
                                        {manageCourseCopy.noData}
                                    </span>
                                ) : (
                                    <span className="shrink-0 font-bold tabular-nums">
                                        {value}%
                                    </span>
                                )}
                            </div>

                            <span
                                role="presentation"
                                className="mt-1 block h-1.75 overflow-hidden rounded-full bg-track"
                            >
                                <span
                                    className={cn(
                                        "block h-full rounded-full",
                                        metric.className,
                                    )}
                                    style={{ width: `${value ?? 0}%` }}
                                />
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

export { CourseHealthCard };
