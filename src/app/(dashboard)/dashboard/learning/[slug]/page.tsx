import { Courses } from "@/components/dashboard/learning/course";
import { getEnrolledCourse, getLessonView } from "@/lib/course-player";
import { isPreviewVia, learningReturnLink } from "@/lib/course-return";
import { canManageCourse } from "@/lib/instructor";
import { notFound } from "next/navigation";
import React from "react";

const EnrolledCoursePage = async ({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const { slug } = await params;
    const course = await getEnrolledCourse(slug);
    if (!course) notFound();

    const { via: rawVia, lesson: rawLesson } = await searchParams;
    const via =
        typeof rawVia === "string" && isPreviewVia(rawVia) ? rawVia : undefined;
    const backLink = learningReturnLink({
        courseSlug: course.slug,
        via,
        canManage: via ? await canManageCourse(course.slug) : false,
    });

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <Courses
                course={course}
                backLink={backLink}
                via={via}
                lesson={await getLessonView(
                    course,
                    typeof rawLesson === "string" ? rawLesson : undefined,
                )}
            />
        </main>
    );
};

export default EnrolledCoursePage;
