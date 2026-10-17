"use client";

import Link from "next/link";
import { ChevronUpIcon, MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { QA_HREF, qaCopy, qaStatusBadge } from "@/lib/config/qa";
import type { QuestionRow } from "@/lib/qa";
import { cn } from "@/lib/utils";

function QuestionCard({
    row,
    voting,
    onVote,
}: {
    row: QuestionRow;
    voting: boolean;
    onVote: () => void;
}) {
    const status = row.answered
        ? qaStatusBadge.answered
        : qaStatusBadge.awaiting;

    return (
        <Card className="gap-0 p-5 ring-border">
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onVote}
                    aria-pressed={row.voted}
                    aria-label={
                        row.voted
                            ? "Remove your vote"
                            : "Vote for this question"
                    }
                    className={cn(
                        "flex w-11.5 shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-lg py-1 transition-colors",
                        row.voted ? "text-foreground" : "text-muted-foreground",
                        "hover:bg-hover",
                    )}
                >
                    {voting ? (
                        <Spinner className="size-4" />
                    ) : (
                        <ChevronUpIcon
                            className={cn(
                                "size-4",
                                row.voted && "text-primary",
                            )}
                        />
                    )}
                    <span className="text-[17px] leading-none font-bold text-foreground tabular-nums">
                        {row.voteCount}
                    </span>
                    <span className="text-[12px] leading-none">
                        {qaCopy.votes}
                    </span>
                </button>

                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-[17px] leading-snug font-bold">
                            <Link
                                href={`${QA_HREF}/${row.id}`}
                                className="text-foreground hover:underline"
                            >
                                {row.title}
                            </Link>
                        </h2>
                        <p className="mt-1.5 line-clamp-2 text-[14px] text-muted-foreground sm:line-clamp-1">
                            {row.body}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="flex items-center gap-2">
                                <Avatar className="size-7">
                                    <AvatarImage
                                        src={row.author.image ?? undefined}
                                        alt=""
                                    />
                                    <AvatarFallback className="text-[11px]">
                                        {row.author.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[14px] font-semibold text-foreground">
                                    {row.author.name}
                                </span>
                            </span>
                            <span className="text-[14px] text-muted-foreground">
                                · {row.age}
                            </span>
                            <span className="inline-block h-6.5 max-w-full truncate rounded-full bg-hover px-3 text-[13px] leading-6.5 text-muted-foreground">
                                {row.courseTitle}
                            </span>
                            {row.lessonLabel ? (
                                <span className="text-[14px] text-muted-foreground">
                                    {row.lessonLabel}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                        <span
                            className={cn(
                                "inline-flex h-6.5 items-center rounded-full px-3 text-[13px] font-medium whitespace-nowrap",
                                status.className,
                            )}
                        >
                            {status.label}
                        </span>
                        <span className="flex items-center gap-2 text-[14px] whitespace-nowrap text-muted-foreground tabular-nums">
                            <MessageCircleIcon className="size-4" />
                            {qaCopy.replies(row.replyCount)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export { QuestionCard };
