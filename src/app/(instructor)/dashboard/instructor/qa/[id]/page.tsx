import { QuestionThread } from "@/components/dashboard/instructor/qa/question-thread";
import { getQuestionDetail } from "@/lib/qa";
import { notFound } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const detail = await getQuestionDetail(id);
    if (!detail) notFound();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <QuestionThread detail={detail} />
        </main>
    );
};

export default Page;
