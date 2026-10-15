import Link from "next/link";
import { StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/components/dashboard/courses/add-to-cart-button";
import {
    categoryIcons as databaseCategoryIcons,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import type { CatalogCourse } from "@/lib/config/catalog-shape";

function CourseCard({ course }: { course: CatalogCourse }) {
    const Icon =
        databaseCategoryIcons[course.categorySlug] ?? FALLBACK_CATEGORY_ICON;

    return (
        <Card className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-card">
            <Link
                href={`/dashboard/courses/${course.slug}`}
                className="flex flex-col"
            >
                <div
                    className={`relative grid aspect-725/276 place-items-center bg-linear-to-br ${course.art}`}
                >
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt=""
                            className="absolute inset-0 size-full object-cover"
                        />
                    ) : (
                        <Icon className="size-12 text-white/25" />
                    )}
                    <Badge className="absolute top-3 left-3 h-5.5 bg-black/55 px-2.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        {course.categoryName}
                    </Badge>
                </div>

                <div className="flex flex-col px-5 pt-4.5">
                    <h3 className="text-lg leading-snug">{course.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {course.instructor}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-sm">
                        <span className="font-bold tabular-nums">
                            {course.rating.toFixed(1)}
                        </span>
                        <StarIcon className="size-3.5 fill-star text-star" />
                        <span className="text-muted-foreground tabular-nums">
                            ({course.reviews.toLocaleString("en-US")})
                        </span>
                    </p>

                    <div className="mt-3 flex items-center gap-2.5 text-sm">
                        <Badge
                            variant="outline"
                            className="h-7 px-2.5 font-normal"
                        >
                            {course.level}
                        </Badge>
                        <span className="text-muted-foreground">
                            {course.durationHours}h
                        </span>
                    </div>
                </div>
            </Link>

            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-5">
                <p className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold tracking-[-0.02em] tabular-nums">
                        ${course.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums line-through">
                        ${course.listPrice.toFixed(2)}
                    </span>
                </p>
                <AddToCartButton slug={course.slug} />
            </div>
        </Card>
    );
}

export { CourseCard };
