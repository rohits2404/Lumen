import { EnrolledCoursesSection } from "@/components/dashboard/learning/enrolled-courses-section";
import { LearningStats } from "@/components/dashboard/learning/learning-stats";
import { getMyLearning } from "@/lib/learning";

async function MyLearning() {
    const { courses, stats } = await getMyLearning();

    return (
        <div>
            <div>
                <h1 className="text-[32px] leading-none">My Learning</h1>
                <p className="mt-2.5 text-muted-foreground">
                    Pick Up Where You Left Off And Keep Your Streak Going.
                </p>
            </div>

            <div className="mt-6">
                <LearningStats stats={stats} />
            </div>

            <div className="mt-6">
                <EnrolledCoursesSection courses={courses} />
            </div>
        </div>
    );
}

export { MyLearning };
