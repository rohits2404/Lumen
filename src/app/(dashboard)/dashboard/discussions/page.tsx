import { DiscussionsBoard } from "@/components/dashboard/discussions/discussions-board";
import { getDiscussionsPage, parseDiscussionsQuery } from "@/lib/discussions";
import { redirect } from "next/navigation";
import React from "react";

const DiscussionPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const page = await getDiscussionsPage(
        "LEARNER",
        parseDiscussionsQuery(params),
    );
    if (!page) redirect("/login");

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <DiscussionsBoard audience="LEARNER" page={page} />
        </main>
    );
};

export default DiscussionPage;
