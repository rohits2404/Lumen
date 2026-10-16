"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseNotesTab } from "@/components/dashboard/learning/course/course-notes-tab";
import { CourseOverviewTab } from "@/components/dashboard/learning/course/course-overview-tab";
import { CourseQaTab } from "@/components/dashboard/learning/course/course-qa-tab";
import { CourseReviewsTab } from "@/components/dashboard/learning/course/course-reviews-tab";
import type { CoursePlayerCourse } from "@/lib/config/course-player";

function CourseTabs({ course }: { course: CoursePlayerCourse }) {
    return (
        <Tabs defaultValue="overview" className="gap-5">
            <TabsList className="h-11! w-fit rounded-xl bg-track p-1">
                {[
                    ["overview", "Overview"],
                    ["qa", "Q&A"],
                    ["reviews", "Reviews"],
                    ["notes", "Notes"],
                ].map(([value, label]) => (
                    <TabsTrigger
                        key={value}
                        value={value}
                        className="h-full flex-none rounded-lg px-4 text-[15px] font-medium data-active:bg-card! data-active:font-semibold"
                    >
                        {label}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="overview">
                <CourseOverviewTab about={course.about} />
            </TabsContent>

            <TabsContent value="qa">
                <CourseQaTab
                    questions={course.questions}
                    instructorFirstName={
                        course.instructor.name.split(" ")[0] ?? "us"
                    }
                />
            </TabsContent>

            <TabsContent value="reviews">
                <CourseReviewsTab
                    rating={course.rating}
                    reviewsCount={course.reviewsCount}
                    reviews={course.reviews}
                />
            </TabsContent>

            <TabsContent value="notes">
                <CourseNotesTab notes={course.notes} />
            </TabsContent>
        </Tabs>
    );
}

export { CourseTabs };
