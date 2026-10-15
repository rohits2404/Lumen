import { GitBranchPlusIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LearningPath } from "@/lib/config/dashboard-overview-shape";

const toneClass = {
    success: "[&_[data-slot=progress-indicator]]:bg-success",
    warning: "[&_[data-slot=progress-indicator]]:bg-warning",
};

function LearningPathCard({
    learningPaths,
}: {
    learningPaths: LearningPath[];
}) {
    return (
        <Card className="gap-0 p-6.5 ring-border">
            <div className="flex items-center justify-between">
                <h2 className="text-base">Learning Path</h2>
                <span className="grid size-7 place-items-center rounded-md text-subtle-foreground">
                    <GitBranchPlusIcon className="size-4" />
                </span>
            </div>

            <div className="mt-5 flex flex-col gap-4">
                {learningPaths.map((path) => (
                    <div key={path.title} className="rounded-xl border p-5">
                        <h3 className="text-[15px] font-bold">{path.title}</h3>
                        <Progress
                            value={(path.completed / path.total) * 100}
                            className={`mt-4 w-full **:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-track ${toneClass[path.tone]}`}
                        />
                        <p className="mt-3 text-[13px] text-muted-foreground">
                            {path.completed} Of {path.total} Modules Completed
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export { LearningPathCard };
