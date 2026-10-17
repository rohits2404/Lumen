import { QuizEditor } from "@/components/dashboard/instructor/courses/edit/quiz-editor";
import { getQuizForEditor } from "@/lib/instructor-course-edit";
import { notFound } from "next/navigation";
import React from "react";

type QuizParams = Promise<{ slug: string; lessonId: string }>;

const Page = async ({ params }: { params: QuizParams }) => {
    const { slug, lessonId } = await params;
    const lesson = await getQuizForEditor(slug, lessonId);
    if (!lesson) notFound();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <QuizEditor lesson={lesson} />
        </main>
    );
};

export default Page;
