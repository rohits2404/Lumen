import { DiscussionThread } from "@/components/dashboard/discussions/discussion-thread";
import { getDiscussionDetail } from "@/lib/discussions";
import { notFound } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const detail = await getDiscussionDetail("LEARNER", id);
    if (!detail) notFound();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <DiscussionThread audience="LEARNER" detail={detail} />
        </main>
    );
};

export default Page;
