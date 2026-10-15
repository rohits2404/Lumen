import {
    editorStepHref,
    editorStepKeys,
    type EditorStepKey,
} from "@/lib/config/course-editor";
import { instructorSlug } from "@/lib/config/instructor-profiles";

const SURFACE_SEGMENTS = {
    sale: "courses",
    learning: "learning",
} as const;

export type CourseSurface = keyof typeof SURFACE_SEGMENTS;

export function instructorProfileHref(
    instructor: { name: string; slug?: string },
    {
        courseSlug,
        via,
        preview,
    }: { courseSlug: string; via: CourseSurface; preview?: string },
) {
    const slug = instructor.slug ?? instructorSlug(instructor.name);
    const carried = isPreviewVia(preview) ? `&preview=${preview}` : "";
    return `/dashboard/instructors/${slug}?from=${courseSlug}&via=${via}${carried}`;
}

export function courseReturnLink({
    from,
    via,
    preview,
    databaseCourse = false,
}: {
    from?: string;
    via?: string;
    preview?: string;
    databaseCourse?: boolean;
}) {
    const carried = isPreviewVia(preview) ? `?via=${preview}` : "";

    const slug = from && databaseCourse ? from : null;
    if (!slug) return { href: "/dashboard/courses", label: "Back to Browse" };

    const surface: CourseSurface = via === "learning" ? "learning" : "sale";
    return {
        href: `/dashboard/${SURFACE_SEGMENTS[surface]}/${slug}${
            surface === "learning" ? carried : ""
        }`,
        label: "Back to course",
    };
}

export const PREVIEW_VIA = "manage";
const EDITOR_VIA_PREFIX = "edit-";

export function previewAsStudentHref(courseSlug: string, from?: EditorStepKey) {
    const via = from ? `${EDITOR_VIA_PREFIX}${from}` : PREVIEW_VIA;
    return `/dashboard/learning/${courseSlug}?via=${via}`;
}

export function isPreviewVia(via: string | undefined): via is string {
    if (via === PREVIEW_VIA) return true;
    return (
        via !== undefined &&
        via.startsWith(EDITOR_VIA_PREFIX) &&
        editorStepKeys.has(via.slice(EDITOR_VIA_PREFIX.length))
    );
}

export function learningReturnLink({
    courseSlug,
    via,
    canManage,
}: {
    courseSlug: string;
    via?: string;
    canManage: boolean;
}) {
    if (canManage && isPreviewVia(via)) {
        return {
            href:
                via === PREVIEW_VIA
                    ? `/dashboard/instructor/courses/${courseSlug}`
                    : editorStepHref(
                          courseSlug,
                          via.slice(EDITOR_VIA_PREFIX.length) as EditorStepKey,
                      ),
            label: "Exit preview",
            preview: true,
        };
    }
    return {
        href: "/dashboard/learning",
        label: "Back to courses",
        preview: false,
    };
}

export function learningCourseHref(courseSlug: string, via?: string) {
    return isPreviewVia(via)
        ? `/dashboard/learning/${courseSlug}?via=${via}`
        : `/dashboard/learning/${courseSlug}`;
}
