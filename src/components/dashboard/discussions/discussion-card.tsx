"use client";

import Link from "next/link";
import { HeartIcon, MessageCircleIcon, PinIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
    authorRoleBadge,
    discussionsCopy,
    discussionsHref,
    type DiscussionAudience,
} from "@/lib/config/discussions";
import type { DiscussionRow } from "@/lib/discussions";
import { cn } from "@/lib/utils";

function DiscussionCard({
    audience,
    row,
    canModerate,
    busy,
    onToggleLike,
    onTogglePin,
}: {
    audience: DiscussionAudience;
    row: DiscussionRow;
    canModerate: boolean;
    busy: "like" | "pin" | null;
    onToggleLike: () => void;
    onTogglePin: () => void;
}) {
    const role = authorRoleBadge(row.author.role);
    const chips = [
        ...(row.isPinned ? [discussionsCopy.pinned] : []),
        row.topicName,
        ...row.tags,
    ];

    return (
        <Card className="gap-0 p-5.5 ring-border">
            <div className="flex gap-4">
                <Avatar className="size-10.75 shrink-0">
                    <AvatarImage src={row.author.image ?? undefined} alt="" />
                    <AvatarFallback className="text-[13px]">
                        {row.author.initials}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="text-[15px] font-bold text-foreground">
                            {row.author.name}
                        </span>
                        <span
                            className={cn(
                                "inline-flex h-5.5 items-center rounded-full px-2.5 text-[12px] font-medium",
                                role.className,
                            )}
                        >
                            {role.label}
                        </span>
                        {row.isPinned ? (
                            <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
                                <PinIcon className="size-3.5" />
                                {discussionsCopy.pinned}
                            </span>
                        ) : null}
                        <span className="text-[13px] text-muted-foreground">
                            · {row.age}
                        </span>
                    </div>

                    <h2 className="mt-1.5 text-[18px] leading-snug font-bold">
                        <Link
                            href={`${discussionsHref[audience]}/${row.id}`}
                            className="text-foreground hover:underline"
                        >
                            {row.title}
                        </Link>
                    </h2>
                    <p className="mt-2 line-clamp-2 text-[15px] text-muted-foreground">
                        {row.body}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {chips.map((chip, index) => (
                            <span
                                key={`${chip}-${index}`}
                                className="inline-flex h-5.5 items-center rounded-full bg-hover px-2.5 text-[13px] text-muted-foreground"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="flex items-center gap-2 text-[14px] text-muted-foreground tabular-nums">
                        <MessageCircleIcon className="size-4" />
                        {row.replyCount}
                    </span>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onToggleLike}
                        disabled={busy === "like"}
                        aria-pressed={row.liked}
                        aria-label={
                            row.liked ? "Remove like" : "Like this discussion"
                        }
                        className="h-auto gap-2 p-0 text-[14px] font-normal text-muted-foreground tabular-nums hover:bg-transparent hover:text-foreground"
                    >
                        {busy === "like" ? (
                            <Spinner className="size-4" />
                        ) : (
                            <HeartIcon
                                className={cn(
                                    "size-4",
                                    row.liked &&
                                        "fill-current text-destructive",
                                )}
                            />
                        )}
                        {row.likeCount}
                    </Button>

                    {canModerate ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label="Discussion actions"
                                        className="size-9 rounded-lg bg-card shadow-sm"
                                    />
                                }
                            >
                                {busy === "pin" ? (
                                    <Spinner />
                                ) : (
                                    <span aria-hidden>···</span>
                                )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={onTogglePin}
                                    className="cursor-pointer"
                                >
                                    <PinIcon />
                                    {row.isPinned
                                        ? "Unpin Thread"
                                        : "Pin To Top"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </div>
        </Card>
    );
}

export { DiscussionCard };
