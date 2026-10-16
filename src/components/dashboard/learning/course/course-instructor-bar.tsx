import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { CoursePlayerCourse } from "@/lib/config/course-player";
import { instructorProfileHref } from "@/lib/course-return";
import { initialsOf } from "./initials";

function CourseInstructorBar({
    instructor,
    courseSlug,
    via,
}: {
    instructor: CoursePlayerCourse["instructor"];
    courseSlug: string;
    via?: string;
}) {
    return (
        <Card className="flex-row items-center justify-between gap-4 p-5 ring-border">
            <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-12 shrink-0">
                    <AvatarImage src={instructor.avatarUrl} alt="" />
                    <AvatarFallback>
                        {initialsOf(instructor.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate font-bold">{instructor.name}</p>
                    <p className="truncate text-[15px] leading-6 text-muted-foreground">
                        Mentor · {instructor.title}
                    </p>
                </div>
            </div>

            <Link
                href={instructorProfileHref(instructor, {
                    courseSlug,
                    via: "learning",
                    preview: via,
                })}
                className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-foreground hover:text-muted-foreground"
            >
                View Profile
                <ChevronRightIcon className="size-4" />
            </Link>
        </Card>
    );
}

export { CourseInstructorBar };
