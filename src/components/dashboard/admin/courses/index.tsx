import {
    CoursesList,
    type CourseListRow,
} from "@/components/dashboard/admin/courses/courses-list";
import { formatSubmittedAt } from "@/components/dashboard/admin/courses/courses-format";
import { adminCoursesCopy } from "@/lib/config/admin-courses";
import { getCoursesPage, type CoursesQuery } from "@/lib/admin/courses";

async function CoursesPage({ query }: { query: CoursesQuery }) {
    const page = await getCoursesPage(query);

    const rows: CourseListRow[] = page.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        status: row.status,
        instructorName: row.instructorName,
        lessonCount: row.lessonCount,
        submittedLabel: formatSubmittedAt(row.submittedAt, page.generatedAt),
        thumbnailUrl: row.thumbnailUrl,
        categorySlug: row.categorySlug,
        categoryAccent: row.categoryAccent,
    }));

    return (
        <main className="w-full px-6 py-6 md:px-8 md:py-8">
            <h1 className="text-[32px] leading-none font-bold">
                {adminCoursesCopy.title}
            </h1>
            <p className="mt-2.5 text-[15px] text-muted-foreground">
                {adminCoursesCopy.description}
            </p>

            <CoursesList rows={rows} page={page} query={query} />
        </main>
    );
}

export { CoursesPage };
