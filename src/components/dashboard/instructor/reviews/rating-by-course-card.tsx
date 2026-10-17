import { StarIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CourseArt } from "@/components/dashboard/course-art";
import { reviewsCopy } from "@/lib/config/instructor-reviews";
import type { RatingByCourseRow } from "@/lib/instructor-reviews";

function RatingByCourseCard({ rows }: { rows: RatingByCourseRow[] }) {
    return (
        <Card className="p-6 ring-border [--card-spacing:0px]">
            <h2 className="text-lg leading-none font-bold">
                {reviewsCopy.byCourse}
            </h2>

            {rows.length === 0 ? (
                <p className="mt-5 text-[15px] text-muted-foreground">
                    {reviewsCopy.noCourses}
                </p>
            ) : (
                <ul className="mt-5 flex flex-col gap-4.5">
                    {rows.map((row) => (
                        <li
                            key={row.id}
                            className="flex items-center gap-3.5 px-2.5"
                        >
                            <CourseArt
                                thumbnailUrl={row.thumbnailUrl}
                                categorySlug={row.categorySlug}
                                categoryAccent={row.categoryAccent}
                                className="h-7.5 w-13.5 rounded-md"
                                iconClassName="size-3.5"
                            />

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] leading-5 font-semibold">
                                    {row.title}
                                </p>
                                <p className="truncate text-[13px] leading-4.5 text-muted-foreground">
                                    {reviewsCopy.reviewsOn(row.reviews)}
                                </p>
                            </div>

                            <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold">
                                <StarIcon className="size-3.5 fill-star text-star" />
                                {row.rating.toFixed(1)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

export { RatingByCourseCard };
