import { ReportedReviewsPage } from "@/components/dashboard/admin/reviews";
import { parseReviewsQuery } from "@/lib/admin/reviews";
import React from "react";

const AdminReviewsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    return <ReportedReviewsPage query={parseReviewsQuery(params)} />;
};

export default AdminReviewsPage;
