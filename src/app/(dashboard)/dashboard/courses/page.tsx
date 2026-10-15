import { BrowseCourses } from "@/components/dashboard/courses/browse-courses";
import { getCatalogCourses } from "@/lib/catalog";
import React from "react";

const BrowseCoursesPage = async () => {
    const courses = await getCatalogCourses();

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <BrowseCourses courses={courses} />
        </main>
    );
};

export default BrowseCoursesPage;
