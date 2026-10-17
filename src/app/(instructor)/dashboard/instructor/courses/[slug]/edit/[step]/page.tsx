import { CourseEditorPage } from "@/components/dashboard/instructor/courses/edit/course-editor-page";
import { EditorNav } from "@/components/dashboard/instructor/courses/edit/editor-nav";
import { getPlatformSettings } from "@/lib/admin/settings";
import { parseEditorStep } from "@/lib/config/course-editor";
import { previewAsStudentHref } from "@/lib/course-return";
import { getCourseCoupons } from "@/lib/instructor-coupons";
import { getCourseForEditor } from "@/lib/instructor-course-edit";
import { notFound } from "next/navigation";
import React from "react";

type EditorParams = Promise<{ slug: string; step: string }>;

const Page = async ({ params }: { params: EditorParams }) => {
    const { slug, step } = await params;
    const course = await getCourseForEditor(slug);
    if (!course) notFound();

    const active = parseEditorStep(step);

    const coupons =
        active === "coupons"
            ? await getCourseCoupons(
                  course.id,
                  (await getPlatformSettings()).defaultRevenueShareBps,
              )
            : null;

    return (
        <CourseEditorPage
            course={course}
            step={active}
            previewHref={previewAsStudentHref(course.slug, active)}
            coupons={coupons}
            nav={
                <EditorNav
                    courseSlug={course.slug}
                    active={active}
                    completed={course.completed}
                />
            }
        />
    );
};

export default Page;
