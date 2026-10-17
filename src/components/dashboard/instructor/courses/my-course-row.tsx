"use client";

import {
    BookOpenTextIcon,
    ReceiptTextIcon,
    StarIcon,
    UsersRoundIcon,
} from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseArt } from "@/components/dashboard/course-art";
import { CourseRowActions } from "@/components/dashboard/instructor/courses/course-row-actions";
import {
    formatCount,
    formatMoneyWhole,
    formatRating,
} from "@/components/dashboard/instructor/courses/courses-format";
import { courseStatusBadge } from "@/lib/config/course-status";
import { editorStepHref, FIRST_STEP } from "@/lib/config/course-editor";
import { hasBeenLive, myCoursesCopy } from "@/lib/config/instructor-courses";
import type { MyCourseRow as MyCourseRowData } from "@/lib/instructor-courses";
import { cn } from "@/lib/utils";

function MyCourseRow({ course }: { course: MyCourseRowData }) {
    const badge = courseStatusBadge(course.status);
    const live = hasBeenLive(course.status);

    return (
        <Card className="flex-row items-center gap-4.5 p-4 ring-border">
            <CourseArt
                thumbnailUrl={course.thumbnailUrl}
                categorySlug={course.categorySlug}
                categoryAccent={course.categoryAccent}
                className="h-23 w-37.5 shrink-0 overflow-hidden rounded-lg"
                iconClassName="size-8"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <h2 className="truncate text-[17px] leading-tight font-bold">
                        {course.title}
                    </h2>
                    <span
                        className={cn(
                            "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[12px] font-medium",
                            badge.className,
                        )}
                    >
                        {badge.label}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-muted-foreground">
                    <MetaChip icon={BookOpenTextIcon}>
                        <span className="font-medium tabular-nums">
                            {formatCount(course.lessonCount)}
                        </span>
                        <span>
                            {course.lessonCount === 1 ? "lesson" : "lessons"}
                        </span>
                    </MetaChip>

                    {course.students !== null ? (
                        <MetaChip icon={UsersRoundIcon}>
                            <span className="font-medium tabular-nums">
                                {formatCount(course.students)}
                            </span>
                        </MetaChip>
                    ) : null}

                    {course.rating !== null ? (
                        <MetaChip
                            icon={StarIcon}
                            iconClassName="fill-star text-star"
                        >
                            <span className="font-medium tabular-nums">
                                {formatRating(course.rating)}
                            </span>
                        </MetaChip>
                    ) : null}

                    {course.revenueCents !== null ? (
                        <MetaChip icon={ReceiptTextIcon}>
                            <span className="font-medium tabular-nums">
                                {formatMoneyWhole(course.revenueCents)}
                            </span>
                        </MetaChip>
                    ) : null}

                    <span className="text-subtle-foreground">
                        {course.updated}
                    </span>
                </div>

                {course.builtPercent !== null ? (
                    <div className="flex w-full max-w-85 items-center gap-3">
                        <span
                            role="presentation"
                            className="h-1.75 min-w-0 flex-1 overflow-hidden rounded-full bg-track"
                        >
                            <span
                                className="block h-full rounded-full bg-primary"
                                style={{ width: `${course.builtPercent}%` }}
                            />
                        </span>
                        <span className="shrink-0 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
                            {myCoursesCopy.built(course.builtPercent)}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
                {live ? (
                    <Button
                        nativeButton={false}
                        render={
                            <Link
                                href={`/dashboard/instructor/courses/${course.slug}`}
                            />
                        }
                        className="h-9.5 px-4 text-[14px]"
                    >
                        {myCoursesCopy.manage}
                    </Button>
                ) : (
                    <Button
                        nativeButton={false}
                        render={
                            <Link
                                href={editorStepHref(course.slug, FIRST_STEP)}
                            />
                        }
                        className="h-9.5 px-4 text-[14px]"
                    >
                        {myCoursesCopy.continueEditing}
                    </Button>
                )}
                <CourseRowActions course={course} />
            </div>
        </Card>
    );
}

function MetaChip({
    icon: Icon,
    iconClassName,
    children,
}: {
    icon: typeof BookOpenTextIcon;
    iconClassName?: string;
    children: React.ReactNode;
}) {
    return (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon className={cn("size-3.5 shrink-0", iconClassName)} />
            {children}
        </span>
    );
}

export { MyCourseRow };
