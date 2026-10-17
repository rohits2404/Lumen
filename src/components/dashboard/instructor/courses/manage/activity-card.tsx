import { Card } from "@/components/ui/card";
import { ActivityItem } from "@/lib/instructor-course-manage";
import {
    activityIcon,
    activityTone,
    manageCourseCopy,
} from "@/lib/config/instructor-course-manage";
import { cn } from "@/lib/utils";

function ActivityCard({ activity }: { activity: ActivityItem[] }) {
    return (
        <Card className="p-5 ring-border [--card-spacing:0px]">
            <h2 className="text-[16px] leading-none font-bold">
                {manageCourseCopy.activityHeading}
            </h2>

            {activity.length === 0 ? (
                <p className="mt-4 text-[15px] leading-5 text-muted-foreground">
                    {manageCourseCopy.activityEmpty}
                </p>
            ) : (
                <ul className="mt-4.5 space-y-5">
                    {activity.map((item) => {
                        const Icon = activityIcon[item.kind];

                        return (
                            <li
                                key={item.id}
                                className="flex items-start gap-3"
                            >
                                <span
                                    className={cn(
                                        "grid size-7.5 shrink-0 place-items-center rounded-md",
                                        activityTone[item.kind],
                                    )}
                                >
                                    <Icon className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] leading-5">
                                        {item.text}
                                    </p>
                                    <p className="mt-0.5 text-[13px] leading-5 text-subtle-foreground">
                                        {item.when}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}

export { ActivityCard };
