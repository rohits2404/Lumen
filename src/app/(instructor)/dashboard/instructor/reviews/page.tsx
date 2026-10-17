import { ReviewsPage } from "@/components/dashboard/instructor/reviews/reviews-page";
import { getReviewsPage, parseReviewsQuery } from "@/lib/instructor-reviews";
import { notFound } from "next/navigation";
import React from "react";

const InstructorReviewsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const params = await searchParams;
    const page = await getReviewsPage(parseReviewsQuery(params));
    if (!page) notFound();

    return <ReviewsPage page={page} />;
};

export default InstructorReviewsPage;
