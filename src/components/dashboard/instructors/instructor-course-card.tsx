import Link from "next/link";
import { StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    categoryIcons as databaseCategoryIcons,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import { categoryIcons } from "@/lib/config/browse-courses";
import type { ProfileCourse } from "@/lib/config/instructor-profiles";
import { cn } from "@/lib/utils";

function InstructorCourseCard({ course }: { course: ProfileCourse }) {
    const Icon =
        (course.glyph.from === "catalog"
            ? categoryIcons[course.glyph.category]
            : databaseCategoryIcons[course.glyph.categorySlug]) ??
        FALLBACK_CATEGORY_ICON;

    return (
        <Card className="gap-0 overflow-hidden p-0 ring-border transition-shadow hover:shadow-card">
            <Link href={course.href} className="flex flex-col">
                <div
                    className={cn(
                        "relative grid aspect-725/276 place-items-center bg-linear-to-br",
                        course.art,
                    )}
                >
                    {course.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={course.thumbnailUrl}
                            alt=""
                            className="absolute inset-0 size-full object-cover"
                        />
                    ) : (
                        <Icon className="size-10 text-white/25" />
                    )}
                    <Badge className="absolute top-3 left-3 h-5.5 bg-black/55 px-2.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        {course.categoryLabel}
                    </Badge>
                </div>

                <div className="flex flex-col gap-1.5 px-4.5 pt-4 pb-4.5">
                    <h3 className="text-base leading-snug">{course.title}</h3>
                    <p className="flex items-center gap-1.5 text-sm">
                        <span className="font-bold tabular-nums">
                            {course.rating.toFixed(1)}
                        </span>
                        <StarIcon className="size-3.5 fill-star text-star" />
                        <span className="text-muted-foreground tabular-nums">
                            ({course.reviews.toLocaleString("en-US")})
                        </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {course.durationHours}h total
                    </p>
                    <p className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-extrabold tracking-[-0.02em] tabular-nums">
                            ${course.price.toFixed(2)}
                        </span>
                        {course.listPrice > course.price ? (
                            <span className="text-sm text-muted-foreground tabular-nums line-through">
                                ${course.listPrice.toFixed(2)}
                            </span>
                        ) : null}
                    </p>
                </div>
            </Link>
        </Card>
    );
}

export { InstructorCourseCard };
