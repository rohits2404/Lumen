"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";

import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { messagesCopy } from "@/lib/config/messages";
import type { ConversationSummary } from "@/lib/messages";
import { cn } from "@/lib/utils";

function ConversationList({
    conversations,
    activeId,
    search,
}: {
    conversations: ConversationSummary[];
    activeId: string | null;
    search: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = React.useTransition();

    const [value, setValue] = React.useState(search);
    const [lastSearch, setLastSearch] = React.useState(search);
    if (search !== lastSearch) {
        setLastSearch(search);
        setValue(search);
    }

    React.useEffect(() => {
        if (value === search) return;
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (value) params.set("q", value);
            else params.delete("q");
            params.delete("c");
            const query = params.toString();
            startTransition(() => {
                router.replace(query ? `${pathname}?${query}` : pathname, {
                    scroll: false,
                });
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [value, search, pathname, router, searchParams]);

    function hrefFor(id: string) {
        const params = new URLSearchParams(searchParams);
        params.set("c", id);
        return `${pathname}?${params.toString()}`;
    }

    return (
        <div className="flex h-55 w-full shrink-0 flex-col border-b border-border md:h-auto md:min-h-0 md:w-80 md:border-r md:border-b-0">
            <div className="flex h-18 shrink-0 items-center border-b border-border px-4">
                <div className="relative w-full">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle-foreground" />
                    <Input
                        type="search"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={messagesCopy.searchPlaceholder}
                        aria-label={messagesCopy.searchPlaceholder}
                        className="h-10 rounded-lg bg-background pl-10 text-[14px] md:text-[14px] dark:bg-background"
                    />
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <p className="px-4 py-6 text-[14px] text-muted-foreground">
                        {messagesCopy.noMatches}
                    </p>
                ) : (
                    conversations.map((conversation) => (
                        <Link
                            key={conversation.id}
                            href={hrefFor(conversation.id)}
                            scroll={false}
                            aria-current={
                                conversation.id === activeId
                                    ? "true"
                                    : undefined
                            }
                            className={cn(
                                "flex h-18 items-center gap-3 border-b border-border-subtle px-4 transition-colors",
                                conversation.id === activeId
                                    ? "bg-hover"
                                    : "hover:bg-hover/60",
                            )}
                        >
                            <Avatar className="size-11">
                                <AvatarImage
                                    src={
                                        conversation.counterpart.image ??
                                        undefined
                                    }
                                    alt=""
                                />
                                <AvatarFallback className="text-[13px]">
                                    {conversation.counterpart.initials}
                                </AvatarFallback>
                                {conversation.counterpart.online ? (
                                    <AvatarBadge
                                        title={messagesCopy.presence}
                                        className="bg-success ring-card group-data-[size=default]/avatar:size-2"
                                    />
                                ) : null}
                            </Avatar>

                            <div className="grid min-w-0 flex-1 gap-0.5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                                        {conversation.counterpart.name}
                                    </span>
                                    <span className="shrink-0 text-[12px] text-muted-foreground">
                                        {conversation.age}
                                    </span>
                                </div>
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="min-w-0 flex-1 truncate text-[14px] text-muted-foreground">
                                        {conversation.preview}
                                    </span>
                                    {conversation.unread > 0 ? (
                                        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                                            {conversation.unread > 9
                                                ? "9+"
                                                : conversation.unread}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <span className="sr-only">
                                {conversation.courseTitle ?? ""}
                                {conversation.unread > 0
                                    ? ` · ${conversation.unread} Unread`
                                    : ""}
                            </span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export { ConversationList };
