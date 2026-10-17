import Link from "next/link";
import { StarIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
    adminOverviewCopy,
    categoryGradients,
    categoryIcons,
    FALLBACK_CATEGORY_GRADIENT,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import type { TopCourse } from "@/lib/admin/overview";
import { cn } from "@/lib/utils";

function TopCoursesCard({ courses }: { courses: TopCourse[] }) {
    if (courses.length === 0) {
        return (
            <Card className="px-5 ring-border [--card-spacing:--spacing(5)]">
                <p className="text-[15px] text-muted-foreground">
                    {adminOverviewCopy.topCoursesEmpty}
                </p>
            </Card>
        );
    }

    return (
        <Card className="divide-y divide-border-subtle ring-border [--card-spacing:0px]">
            {courses.map((course) => {
                const Icon =
                    categoryIcons[course.categorySlug] ??
                    FALLBACK_CATEGORY_ICON;
                const gradient =
                    categoryGradients[course.categoryAccent] ??
                    FALLBACK_CATEGORY_GRADIENT;

                return (
                    <Link
                        key={course.slug}
                        href={`/dashboard/admin/courses/${course.slug}`}
                        className="flex h-15 items-center gap-4 px-4.5 no-underline transition-colors hover:bg-hover/60"
                    >
                        <div
                            className={cn(
                                "grid h-7.5 w-11 shrink-0 place-items-center rounded-md bg-linear-to-br",
                                gradient,
                            )}
                        >
                            <Icon className="size-4 text-white/30" />
                        </div>

                        <span className="min-w-0 flex-1 truncate text-base font-semibold">
                            {course.title}
                        </span>

                        <span className="hidden truncate text-[15px] text-muted-foreground sm:block">
                            {course.categoryName}
                        </span>

                        <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold tabular-nums">
                            <StarIcon className="size-3.5 fill-star text-star" />
                            {course.rating.toFixed(1)}
                        </span>

                        <span className="w-16 shrink-0 text-right text-[15px] font-semibold tabular-nums">
                            {course.enrollmentCount.toLocaleString("en-US")}
                        </span>
                    </Link>
                );
            })}
        </Card>
    );
}

export { TopCoursesCard };
