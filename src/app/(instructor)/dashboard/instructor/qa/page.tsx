import { QaBoard } from "@/components/dashboard/instructor/qa/qa-board";
import { getQuestionsPage, parseQuestionsQuery } from "@/lib/qa";
import { notFound } from "next/navigation";
import React from "react";

const InstructorQAPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const page = await getQuestionsPage(parseQuestionsQuery(params));
    if (!page) notFound();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <QaBoard page={page} />
        </main>
    );
};

export default InstructorQAPage;
