import { CourseReviewPage } from "@/components/dashboard/admin/courses/course-review-page";
import { getCourseReview } from "@/lib/admin/courses";
import { notFound } from "next/navigation";
import React from "react";

const AdminCourseReviewPage = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}) => {
    const course = await getCourseReview((await params).slug);
    if (!course) notFound();
    return <CourseReviewPage course={course} />;
};

export default AdminCourseReviewPage;
