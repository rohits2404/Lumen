import type { ManageCoursePage as ManageCoursePageData } from "@/lib/instructor-course-manage";
import { ManageHeader } from "./manage-header";
import { ManageStats } from "./manage-stats";
import { manageCourseCopy } from "@/lib/config/instructor-course-manage";
import { ManageSections } from "./manage-sections";
import { CourseHealthCard } from "./course-health-card";
import { ActivityCard } from "./activity-card";

function ManageCoursePage({
    course,
    builtRows,
}: {
    course: ManageCoursePageData;
    builtRows: Set<string>;
}) {
    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <ManageHeader course={course} />
            <ManageStats stats={course.stats} />

            <h2 className="mt-7.5 text-[17px] leading-none font-bold">
                {manageCourseCopy.manageHeading}
            </h2>

            <div className="mt-4 grid items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_576px]">
                <ManageSections
                    facts={course.facts}
                    course={{
                        id: course.id,
                        slug: course.slug,
                        quizLessonIds: course.quizLessonIds,
                    }}
                    builtRows={builtRows}
                />

                <div className="flex flex-col gap-4.5">
                    <CourseHealthCard
                        health={course.health}
                        hasQuizzes={course.facts.quizzes > 0}
                    />
                    <ActivityCard activity={course.activity} />
                </div>
            </div>
        </main>
    );
}

export { ManageCoursePage };
