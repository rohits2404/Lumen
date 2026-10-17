import { Analytics } from "@/components/dashboard/instructor/analytics";
import {
    getAnalyticsPage,
    parseAnalyticsQuery,
} from "@/lib/instructor-analytics";
import { notFound } from "next/navigation";
import React from "react";

const InstructorAnalyticsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const page = await getAnalyticsPage(parseAnalyticsQuery(params));
    if (!page) notFound();

    return <Analytics page={page} />;
};

export default InstructorAnalyticsPage;
