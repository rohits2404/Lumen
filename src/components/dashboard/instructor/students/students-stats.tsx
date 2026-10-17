import { CircleCheckIcon, FlameIcon, StarIcon, UsersIcon } from "lucide-react";
import { CountCard } from "@/components/dashboard/count-card";
import { formatCount } from "@/components/dashboard/instructor/students/students-format";
import { studentStats } from "@/lib/config/instructor-students";
import type { StudentsPage } from "@/lib/instructor-students";

function StudentsStats({ stats }: { stats: StudentsPage["stats"] }) {
    return (
        <>
            <CountCard
                icon={UsersIcon}
                value={formatCount(stats.total)}
                label={studentStats.total}
            />
            <CountCard
                icon={FlameIcon}
                value={formatCount(stats.activeThisWeek)}
                label={studentStats.activeThisWeek}
            />
            <CountCard
                icon={CircleCheckIcon}
                value={
                    stats.completionRate === null
                        ? "—"
                        : `${stats.completionRate}%`
                }
                label={studentStats.completion}
            />
            <CountCard
                icon={StarIcon}
                value={stats.rating === null ? "—" : stats.rating.toFixed(1)}
                label={studentStats.rating}
            />
        </>
    );
}

export { StudentsStats };
