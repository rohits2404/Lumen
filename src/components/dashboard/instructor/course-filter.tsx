"use client";

import { LayoutGridIcon } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function CourseFilter({
    courses,
    value,
    onValueChange,
    label,
    className,
}: {
    courses: readonly { id: string; title: string }[];
    value: string | null;
    onValueChange: (courseId: string | null) => void;
    label: string;
    className?: string;
}) {
    return (
        <Select
            value={value ?? ALL}
            onValueChange={(next: string | null) =>
                onValueChange(!next || next === ALL ? null : next)
            }
        >
            <SelectTrigger
                aria-label={label}
                className={cn(
                    "gap-2 rounded-lg bg-card shadow-sm",
                    "**:data-[slot=select-value]:min-w-0",
                    className,
                )}
            >
                <LayoutGridIcon className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue>
                    {(current: string) => (
                        <span className="truncate">
                            {courses.find((course) => course.id === current)
                                ?.title ?? label}
                        </span>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value={ALL}>{label}</SelectItem>
                {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                        {course.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

const ALL = "all";

export { CourseFilter };
