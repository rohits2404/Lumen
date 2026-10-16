import Link from "next/link";
import { ClockIcon, SignalIcon, StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    EnrollNowButton,
    RemoveFromWishlistButton,
} from "@/components/dashboard/wishlist/wishlist-actions";
import type { WishlistCourse } from "@/components/dashboard/wishlist/wishlist-course";
import {
    categoryIcons as databaseCategoryIcons,
    FALLBACK_CATEGORY_ICON,
} from "@/lib/config/admin-overview";
import { cn } from "@/lib/utils";

function WishlistRow({ course }: { course: WishlistCourse }) {
    const Icon =
        databaseCategoryIcons[course.categorySlug] ?? FALLBACK_CATEGORY_ICON;
    const href = `/dashboard/courses/${course.slug}`;

    return (
        <Card className="flex-row items-center gap-5 p-4 ring-border">
            <Link
                href={href}
                aria-hidden
                tabIndex={-1}
                className={cn(
                    "relative grid h-23 w-37.5 shrink-0 place-items-center rounded-lg bg-linear-to-br",
                    course.art,
                )}
            >
                <Icon className="size-7 text-white/25" />
                <Badge className="absolute top-2.5 left-3 h-5 bg-black/55 px-2 text-[10px] font-medium text-white backdrop-blur-sm">
                    {course.categoryName}
                </Badge>
            </Link>

            <div className="min-w-0 flex-1">
                <Link
                    href={href}
                    className="text-[17px] leading-none font-bold hover:underline"
                >
                    {course.title}
                </Link>
                <p className="mt-1.5 text-sm leading-none text-muted-foreground">
                    {course.instructor}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] leading-none text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground tabular-nums">
                            {course.rating.toFixed(1)}
                        </span>
                        <StarIcon className="size-3.5 fill-star text-star" />
                        <span className="tabular-nums">
                            ({course.reviews.toLocaleString("en-US")})
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <SignalIcon className="size-4" />
                        {course.level}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <ClockIcon className="size-4" />
                        {course.durationHours}h
                    </span>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3">
                <p className="flex items-baseline gap-2 leading-none">
                    <span className="text-xl font-extrabold tracking-[-0.02em] tabular-nums">
                        ${course.price.toFixed(2)}
                    </span>
                    <span className="text-[13px] text-muted-foreground tabular-nums line-through">
                        ${course.listPrice.toFixed(2)}
                    </span>
                </p>
                <div className="flex items-center gap-2">
                    <RemoveFromWishlistButton
                        slug={course.slug}
                        title={course.title}
                    />
                    <EnrollNowButton slug={course.slug} />
                </div>
            </div>
        </Card>
    );
}

export { WishlistRow };
