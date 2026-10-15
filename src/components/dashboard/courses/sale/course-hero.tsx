import {
    BarChart3Icon,
    ClockIcon,
    PlayIcon,
    StarIcon,
    UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CoursePreviewDialog } from "@/components/dashboard/courses/sale/course-preview-dialog";
import type { CourseDetail } from "@/lib/config/course-details";
import type { SalePreviewLesson } from "@/lib/course-sale";
import { cn } from "@/lib/utils";

function CourseHero({
    course,
    previews = null,
}: {
    course: CourseDetail;
    previews?: SalePreviewLesson[] | null;
}) {
    const { icon: CourseIcon, ...previewCourse } = course;

    return (
        <div
            className={cn(
                "relative aspect-2240/596 overflow-hidden rounded-xl bg-linear-to-br",
                course.art,
            )}
        >
            {course.thumbnailUrl ? (
                <img
                    src={course.thumbnailUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                />
            ) : (
                <CourseIcon className="absolute inset-0 m-auto size-32 text-white/10" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-black/30" />

            <CoursePreviewDialog course={previewCourse} previews={previews}>
                <button
                    type="button"
                    className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-pop transition-colors hover:bg-white/90"
                >
                    <PlayIcon className="size-4 fill-foreground" />
                    Preview This Course
                </button>
            </CoursePreviewDialog>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
                <Badge className="h-6 w-fit bg-black/55 px-3 text-xs font-medium text-white backdrop-blur-sm">
                    {course.category}
                </Badge>
                <h1 className="text-[32px] leading-tight text-white">
                    {course.title}
                </h1>
                <p className="max-w-2xl text-[15px] text-white/80">
                    {course.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-white/90">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                        {course.rating.toFixed(1)}
                        <span className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                                <StarIcon
                                    key={i}
                                    className={cn(
                                        "size-3.5",
                                        i < Math.round(course.rating)
                                            ? "fill-star text-star"
                                            : "fill-white/30 text-white/30",
                                    )}
                                />
                            ))}
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <UsersIcon className="size-4" />
                        {course.reviews.toLocaleString("en-US")} Students
                    </span>
                    <span className="flex items-center gap-1.5">
                        <BarChart3Icon className="size-4" />
                        {course.level}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <ClockIcon className="size-4" />
                        {course.durationHours}h Total
                    </span>
                </div>
            </div>
        </div>
    );
}

export { CourseHero };
