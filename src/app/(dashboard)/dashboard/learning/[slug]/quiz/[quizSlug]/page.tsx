import { Quiz } from "@/components/dashboard/learning/quiz";
import { getEnrolledCourseQuiz } from "@/lib/course-player";
import { learningCourseHref } from "@/lib/course-return";
import { notFound, redirect } from "next/navigation";
import React from "react";

type QuizParams = Promise<{ slug: string; quizSlug: string }>;

const CourseQuizPage = async ({
    params,
    searchParams,
}: {
    params: QuizParams;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const { slug, quizSlug } = await params;
    const found = await getEnrolledCourseQuiz(slug, quizSlug);
    if (!found) notFound();

    if (found.course.access === "preview") {
        if (found.course.published) redirect(`/dashboard/courses/${slug}`);
        notFound();
    }

    const { via } = await searchParams;
    const courseHref = learningCourseHref(
        slug,
        typeof via === "string" ? via : undefined,
    );

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <Quiz quiz={found.quiz} courseHref={courseHref} />
        </main>
    );
};

export default CourseQuizPage;
