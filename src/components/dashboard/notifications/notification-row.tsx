"use client";

import { MailIcon, MailOpenIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { feedCategory, feedCopy } from "@/lib/config/notification-feed";
import type { FeedNotification } from "@/lib/notification-feed";
import type { NotificationAudience } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

function NotificationRow({
    audience,
    row,
    busy,
    onOpen,
    onToggleRead,
    onResolve,
    variant = "list",
}: {
    audience: NotificationAudience;
    row: FeedNotification;
    busy: "open" | "accept" | "decline" | "toggle" | null;
    onOpen: (id: string) => void;
    onToggleRead: (id: string, read: boolean) => void;
    onResolve: (id: string, accept: boolean) => void;
    variant?: "list" | "grid";
}) {
    const category = feedCategory(audience, row.category);
    const Icon = category.icon;

    return (
        <div
            className={cn(
                "flex items-start gap-3.5 px-6 py-5 transition-colors",
                row.unread ? "bg-hover" : "bg-card",
                variant === "grid" && "h-full rounded-xl border px-5 py-4.5",
            )}
        >
            {row.actor ? (
                <Avatar className="size-10.5 shrink-0">
                    <AvatarImage
                        src={row.actor.image ?? undefined}
                        alt=""
                        referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-hover text-xs font-semibold text-foreground">
                        {row.actor.initials}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <span
                    aria-hidden
                    className={cn(
                        "grid size-10.5 shrink-0 place-items-center rounded-xl",
                        category.tile,
                    )}
                >
                    <Icon className="size-5" />
                </span>
            )}

            <div className="min-w-0 flex-1">
                <button
                    type="button"
                    onClick={() => onOpen(row.id)}
                    disabled={busy !== null || !row.unread}
                    className="flex max-w-full cursor-pointer items-center gap-2 text-left disabled:cursor-default"
                >
                    <span className="truncate text-[15px] leading-5.5 font-bold">
                        {row.title}
                    </span>
                    {row.unread ? (
                        <span
                            aria-hidden
                            className="size-1.75 shrink-0 rounded-full bg-accent-2"
                        />
                    ) : null}
                    <span className="sr-only">
                        {row.unread ? " — unread, mark as read" : " — read"}
                    </span>
                </button>

                {row.body ? (
                    <p className="mt-0.5 text-[15px] leading-5.5 text-muted-foreground">
                        {row.body}
                    </p>
                ) : null}

                {row.action?.state === "PENDING" ? (
                    <div className="mt-3.5 flex flex-wrap gap-2.5">
                        <Button
                            type="button"
                            loading={busy === "accept"}
                            disabled={busy !== null}
                            onClick={() => onResolve(row.id, true)}
                            className="h-9 px-5"
                        >
                            {feedCopy.accept}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            loading={busy === "decline"}
                            disabled={busy !== null}
                            onClick={() => onResolve(row.id, false)}
                            className="h-9 bg-card px-5 shadow-sm"
                        >
                            {feedCopy.decline}
                        </Button>
                    </div>
                ) : row.action ? (
                    <p className="mt-2 text-[13px] font-semibold text-muted-foreground">
                        {row.action.state === "ACCEPTED"
                            ? feedCopy.accepted
                            : feedCopy.declined}
                    </p>
                ) : null}
            </div>

            <div
                className={cn(
                    "flex shrink-0 items-center gap-4 pt-0.5",
                    variant === "grid" && "flex-col items-end gap-1.5",
                )}
            >
                <span
                    className={cn(
                        "inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium",
                        category.pill,
                    )}
                >
                    <span
                        aria-hidden
                        className={cn("size-1.5 rounded-full", category.dot)}
                    />
                    {category.label}
                </span>
                <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                    {row.age}
                </span>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    loading={busy === "toggle"}
                    disabled={busy !== null}
                    title={row.unread ? feedCopy.markRead : feedCopy.markUnread}
                    aria-label={
                        row.unread ? feedCopy.markRead : feedCopy.markUnread
                    }
                    onClick={() => onToggleRead(row.id, row.unread)}
                    className="size-8 shrink-0 text-muted-foreground"
                >
                    {row.unread ? (
                        <MailOpenIcon className="size-4" />
                    ) : (
                        <MailIcon className="size-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}

export { NotificationRow };
