import { CourseArt } from "@/components/dashboard/course-art";
import { Button } from "@/components/ui/button";
import { courseStatusBadge } from "@/lib/config/course-status";
import { ManageCoursePage } from "@/lib/instructor-course-manage";
import { previewAsStudentHref } from "@/lib/course-return";
import { manageCourseCopy } from "@/lib/config/instructor-course-manage";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon, GraduationCapIcon } from "lucide-react";
import Link from "next/link";
import { PublishToggle } from "./publish-toggle";

function ManageHeader({ course }: { course: ManageCoursePage }) {
    const badge = courseStatusBadge(course.status);
    const published = course.status === "PUBLISHED";

    return (
        <div>
            <Link
                href="/dashboard/instructor/courses"
                className="inline-flex items-center gap-2 text-[14px] leading-none text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeftIcon className="size-4" />
                {manageCourseCopy.back}
            </Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
                <div className="flex min-w-0 items-start gap-5">
                    <CourseArt
                        thumbnailUrl={course.thumbnailUrl}
                        categorySlug={course.categorySlug}
                        categoryAccent={course.categoryAccent}
                        className="h-16 w-24 shrink-0 overflow-hidden rounded-xl"
                        iconClassName="size-6"
                    />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="truncate text-2xl leading-tight font-bold">
                                {course.title}
                            </h1>
                            <span
                                className={cn(
                                    "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[12px] font-medium",
                                    badge.className,
                                )}
                            >
                                {badge.label}
                            </span>
                        </div>
                        <p className="mt-2 text-[15px] text-muted-foreground">
                            {manageCourseCopy.lead}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-4">
                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                            <Link href={previewAsStudentHref(course.slug)} />
                        }
                        className="h-9.5 gap-2 bg-card px-4 text-[14px]"
                    >
                        <GraduationCapIcon className="size-4" />
                        {manageCourseCopy.preview}
                    </Button>

                    <PublishToggle courseId={course.id} published={published} />
                </div>
            </div>
        </div>
    );
}

export { ManageHeader };
