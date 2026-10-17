"use client";

import Link from "next/link";
import {
    EllipsisIcon,
    ExternalLinkIcon,
    MessageCircleQuestionMarkIcon,
    TicketPercentIcon,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { courseRowMenu } from "@/lib/config/instructor-courses";
import type { MyCourseRow } from "@/lib/instructor-courses";

function CourseRowActions({ course }: { course: MyCourseRow }) {
    const published = course.status === "PUBLISHED";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`${courseRowMenu.label} ${course.title}`}
                className="grid size-9.5 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground ring-1 ring-border transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <EllipsisIcon className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
                {published ? (
                    <DropdownMenuItem
                        render={
                            <Link href={`/dashboard/courses/${course.slug}`} />
                        }
                        className="cursor-pointer p-2"
                    >
                        <ExternalLinkIcon />
                        {courseRowMenu.viewSalePage}
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        disabled
                        title={courseRowMenu.viewSalePageUnavailable}
                        className="p-2"
                    >
                        <ExternalLinkIcon />
                        {courseRowMenu.viewSalePage}
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem
                    render={
                        <Link
                            href={`/dashboard/instructor/qa?course=${course.id}`}
                        />
                    }
                    className="cursor-pointer p-2"
                >
                    <MessageCircleQuestionMarkIcon />
                    {courseRowMenu.questions}
                </DropdownMenuItem>

                <DropdownMenuItem
                    render={
                        <Link
                            href={`/dashboard/instructor/coupons?course=${course.id}`}
                        />
                    }
                    className="cursor-pointer p-2"
                >
                    <TicketPercentIcon />
                    {courseRowMenu.coupons}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { CourseRowActions };
