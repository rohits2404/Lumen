import type { InstructorCoursesPage } from "@/lib/instructor-courses";
import { CoursesBoard } from "./courses-board";
import { CoursesStats } from "./courses-stats";

function MyCourses({
    page,
    authoringBuilt,
}: {
    page: InstructorCoursesPage;
    authoringBuilt: boolean;
}) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <CoursesBoard page={page} authoringBuilt={authoringBuilt}>
                <CoursesStats stats={page.stats} />
            </CoursesBoard>
        </main>
    );
}

export { MyCourses };
