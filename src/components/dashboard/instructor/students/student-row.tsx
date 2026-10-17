"use client";

import { MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatQuiz } from "@/components/dashboard/instructor/students/students-format";
import {
    studentsCopy,
    studentStatusBadge,
    studentStatusLabel,
} from "@/lib/config/instructor-students";
import type { StudentRow as Row } from "@/lib/instructor-students";
import { cn } from "@/lib/utils";

function StudentTableRow({
    row,
    onMessage,
    busy,
}: {
    row: Row;
    onMessage: () => void;
    busy: boolean;
}) {
    return (
        <TableRow className="h-17.25 border-border-subtle hover:bg-transparent">
            <TableCell className="px-5">
                <div className="flex items-center gap-2.5">
                    <Avatar className="size-10 shrink-0">
                        <AvatarImage src={row.image ?? undefined} alt="" />
                        <AvatarFallback className="text-[13px]">
                            {row.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-[15px] leading-5 font-semibold">
                            {row.name}
                        </p>
                        <p className="truncate text-[13px] leading-5 text-muted-foreground">
                            {row.email}
                        </p>
                    </div>
                </div>
            </TableCell>

            <TableCell className="px-5 text-[15px] text-muted-foreground">
                <span className="block max-w-65 truncate">
                    {row.courseTitle}
                </span>
            </TableCell>

            <TableCell className="px-5">
                <div className="grid gap-1.5">
                    <div className="flex items-center gap-3.5">
                        <span
                            role="presentation"
                            className="h-1.75 w-56.25 shrink-0 overflow-hidden rounded-full bg-track"
                        >
                            <span
                                className="block h-full rounded-full bg-primary"
                                style={{
                                    width: `${Math.min(100, Math.max(0, row.progressPercent))}%`,
                                }}
                            />
                        </span>
                        <span className="text-[14px] font-semibold tabular-nums">
                            {row.progressPercent}%
                        </span>
                    </div>
                    <span className="text-[13px] text-muted-foreground tabular-nums">
                        {studentsCopy.lessons(
                            row.completedLessons,
                            row.totalLessons,
                        )}
                    </span>
                </div>
            </TableCell>

            <TableCell className="px-5 text-[15px] font-semibold tabular-nums">
                {formatQuiz(row.quiz)}
            </TableCell>

            <TableCell className="px-5">
                <div className="grid gap-1.5">
                    <span className="text-[14px] whitespace-nowrap text-muted-foreground">
                        {row.lastActive}
                    </span>
                    <span
                        className={cn(
                            "inline-flex h-5.5 w-fit items-center rounded-full px-2.5 text-[12px] font-medium",
                            studentStatusBadge[row.status],
                        )}
                    >
                        {studentStatusLabel[row.status]}
                    </span>
                </div>
            </TableCell>

            <TableCell className="px-5 text-right">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    loading={busy}
                    onClick={onMessage}
                    aria-label={studentsCopy.message(row.name)}
                    title={studentsCopy.message(row.name)}
                    className="size-9.5 bg-card shadow-sm"
                >
                    <MailIcon className="size-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

export { StudentTableRow };
