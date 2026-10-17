import {
    BookOpenTextIcon,
    FileTextIcon,
    StarIcon,
    UsersRoundIcon,
} from "lucide-react";

import { CountCard } from "@/components/dashboard/count-card";
import {
    formatCount,
    formatRating,
} from "@/components/dashboard/instructor/courses/courses-format";
import { myCoursesStats } from "@/lib/config/instructor-courses";
import type { InstructorCoursesPage } from "@/lib/instructor-courses";

function CoursesStats({ stats }: { stats: InstructorCoursesPage["stats"] }) {
    return (
        <>
            <CountCard
                icon={BookOpenTextIcon}
                value={formatCount(stats.published)}
                label={myCoursesStats.published}
            />
            <CountCard
                icon={FileTextIcon}
                value={formatCount(stats.drafts)}
                label={myCoursesStats.drafts}
            />
            <CountCard
                icon={UsersRoundIcon}
                value={formatCount(stats.students)}
                label={myCoursesStats.students}
            />
            <CountCard
                icon={StarIcon}
                value={stats.rating === null ? "—" : formatRating(stats.rating)}
                label={myCoursesStats.rating}
            />
        </>
    );
}

export { CoursesStats };
