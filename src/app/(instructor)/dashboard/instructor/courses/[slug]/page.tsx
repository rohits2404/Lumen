import { ManageCoursePage } from "@/components/dashboard/instructor/courses/manage/manage-course-page";
import { manageGroups } from "@/lib/config/instructor-course-manage";
import { instructorNav } from "@/lib/config/instructor-nav";
import { getManageCoursePage } from "@/lib/instructor-course-manage";
import { notFound } from "next/navigation";

function builtRowKeys(): Set<string> {
    const built = new Map(
        instructorNav
            .flatMap((group) => group.items)
            .map((item) => [item.href, item.built ?? true] as const),
    );

    const keys = new Set<string>();
    for (const group of manageGroups) {
        for (const row of group.rows) {
            if (
                row.navHref === undefined ||
                (built.get(row.navHref) ?? false)
            ) {
                keys.add(row.key);
            }
        }
    }
    return keys;
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const course = await getManageCoursePage(slug);
    if (!course) notFound();

    return <ManageCoursePage course={course} builtRows={builtRowKeys()} />;
};

export default Page;
