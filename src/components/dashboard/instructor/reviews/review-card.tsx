"use client";

import { CircleCheckIcon, InfoIcon, MessageCircleIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stars } from "@/components/dashboard/instructor/reviews/stars";
import { userRoleBadge } from "@/lib/config/admin-users";
import { reviewsCopy } from "@/lib/config/instructor-reviews";
import type { ReviewRow } from "@/lib/instructor-reviews";
import { cn } from "@/lib/utils";

function ReviewCard({
    row,
    busy,
    onReply,
    onReport,
}: {
    row: ReviewRow;
    busy: "reply" | "report" | null;
    onReply: () => void;
    onReport: () => void;
}) {
    const badge = userRoleBadge("instructor");

    return (
        <Card className="p-0 ring-border [--card-spacing:0px]">
            <div className="px-5.5 py-5">
                <div className="flex gap-3.5">
                    <Avatar className="size-10.5 shrink-0">
                        <AvatarImage
                            src={row.authorImage ?? undefined}
                            alt=""
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-hover text-[13px] font-semibold text-foreground">
                            {row.authorInitials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-5.5">
                            <span className="font-bold">{row.authorName}</span>
                            <span className="sr-only">
                                {reviewsCopy.rated(row.rating)}
                            </span>
                            <Stars rating={row.rating} />
                            <span className="text-[14px] text-subtle-foreground">
                                · {row.createdAgo}
                            </span>
                        </div>
                        <p className="truncate text-[14px] leading-5 text-muted-foreground">
                            {row.courseTitle}
                        </p>

                        {row.title ? (
                            <p className="mt-0.5 text-base leading-6 font-bold">
                                {row.title}
                            </p>
                        ) : null}
                        <p
                            className={cn(
                                "text-[15px] leading-6 text-muted-foreground",
                                row.title ? "mt-1" : "mt-2",
                            )}
                        >
                            {row.body}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            {row.reply ? (
                                <span className="flex items-center gap-2 text-[15px] font-medium text-success">
                                    <CircleCheckIcon className="size-4" />
                                    {reviewsCopy.replied}
                                </span>
                            ) : (
                                <Button
                                    type="button"
                                    loading={busy === "reply"}
                                    onClick={onReply}
                                    className="h-10 gap-2 px-4"
                                >
                                    <MessageCircleIcon className="size-4" />
                                    {reviewsCopy.reply}
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                loading={busy === "report"}
                                disabled={row.reported}
                                title={
                                    row.reported
                                        ? reviewsCopy.reportPending
                                        : undefined
                                }
                                onClick={onReport}
                                className="h-10 gap-2 bg-card px-4 text-muted-foreground shadow-sm"
                            >
                                <InfoIcon className="size-4" />
                                {reviewsCopy.report}
                            </Button>
                        </div>

                        {row.reply ? (
                            <div className="mt-3.5 flex gap-3 border-l-2 border-border pl-3.5">
                                <Avatar className="size-7.5 shrink-0">
                                    <AvatarImage
                                        src={row.reply.authorImage ?? undefined}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                    />
                                    <AvatarFallback className="bg-hover text-[11px] font-semibold text-foreground">
                                        {row.reply.authorInitials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="text-[15px] leading-5.5 font-bold">
                                            {row.reply.authorName}
                                        </span>
                                        <span
                                            className={cn(
                                                "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-3.5 font-medium",
                                                badge.className,
                                            )}
                                        >
                                            {reviewsCopy.instructor}
                                        </span>
                                    </div>
                                    <p className="text-[15px] leading-5 text-muted-foreground">
                                        {row.reply.body}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export { ReviewCard };
