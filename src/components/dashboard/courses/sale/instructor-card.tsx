import Link from "next/link";
import { ChevronRightIcon, StarIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CourseInstructorProfile } from "@/lib/config/course-details";
import { instructorProfileHref } from "@/lib/course-return";

function initialsOf(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("");
}

function InstructorCard({
    instructor,
    courseSlug,
}: {
    instructor: CourseInstructorProfile;
    courseSlug: string;
}) {
    return (
        <Card className="gap-0 p-6.5 ring-border">
            <h2 className="text-lg">Your instructor</h2>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Avatar className="size-14">
                        <AvatarImage src={instructor.avatarUrl} alt="" />
                        <AvatarFallback className="text-base">
                            {initialsOf(instructor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{instructor.name}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {instructor.title} · Teaching since{" "}
                            {instructor.teachingSince}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <StarIcon className="size-3.5 fill-star text-star" />
                                <span className="font-semibold text-foreground">
                                    {instructor.rating.toFixed(1)}
                                </span>
                                rating
                            </span>
                            <span>
                                {instructor.reviewsCount.toLocaleString(
                                    "en-US",
                                )}{" "}
                                Reviews
                            </span>
                            <span>
                                {instructor.studentsCount.toLocaleString(
                                    "en-US",
                                )}{" "}
                                Students
                            </span>
                            <span>
                                {instructor.coursesCount} course
                                {instructor.coursesCount === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="gap-1 font-semibold shadow-sm"
                    nativeButton={false}
                    render={
                        <Link
                            href={instructorProfileHref(instructor, {
                                courseSlug,
                                via: "sale",
                            })}
                        />
                    }
                >
                    View Profile
                    <ChevronRightIcon
                        data-icon="inline-end"
                        className="size-4"
                    />
                </Button>
            </div>

            <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
                {instructor.bio}
            </p>
        </Card>
    );
}

export { InstructorCard };
