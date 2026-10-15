import { CourseSale } from "@/components/dashboard/courses/sale";
import { getSaleCourse } from "@/lib/course-sale";
import { notFound } from "next/navigation";
import React from "react";

const CourseSlugPage = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;
    const sale = await getSaleCourse(slug);
    if (!sale) notFound();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <CourseSale
                course={sale.course}
                previews={sale.previews}
                purchasable={sale.purchasable}
            />
        </main>
    );
};

export default CourseSlugPage;
