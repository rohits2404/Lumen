"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    CheckIcon,
    LayoutGridIcon,
    ListIcon,
    SearchIcon,
    SettingsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/toast";
import { NotificationRow } from "./notification-row";
import {
    markAllNotificationsRead,
    resolveNotificationAction,
    setNotificationRead,
} from "@/lib/actions/notification-feed";
import {
    ALL_TYPES_ICON,
    feedCategories,
    feedCopy,
    feedEmpty,
    feedLead,
    feedSettingsHref,
    feedStatuses,
} from "@/lib/config/notification-feed";
import type { FeedPage } from "@/lib/notification-feed";
import type { NotificationAudience } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const CONTROL = "h-12 rounded-xl";

type RowBusy = "open" | "accept" | "decline" | "toggle" | null;
type Busy =
    | { kind: "markAll" }
    | { kind: "open" | "accept" | "decline" | "toggle"; id: string }
    | null;

function NotificationsFeed({
    audience,
    feed,
}: {
    audience: NotificationAudience;
    feed: FeedPage;
}) {
    const categories = feedCategories[audience];
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();
    const [, startSaving] = React.useTransition();
    const [view, setView] = React.useState<"list" | "grid">("list");

    const [busy, setBusy] = React.useState<Busy>(null);

    const [search, setSearch] = React.useState(feed.query.search);
    const [lastSearch, setLastSearch] = React.useState(feed.query.search);
    if (feed.query.search !== lastSearch) {
        setLastSearch(feed.query.search);
        setSearch(feed.query.search);
    }

    const push = React.useCallback(
        (changes: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams);
            for (const [key, next] of Object.entries(changes)) {
                if (next === null || next === "") params.delete(key);
                else params.set(key, next);
            }
            params.delete("page");
            const query = params.toString();
            startTransition(() => {
                router.replace(query ? `${pathname}?${query}` : pathname, {
                    scroll: false,
                });
            });
        },
        [pathname, router, searchParams],
    );

    React.useEffect(() => {
        if (search === feed.query.search) return;
        const timer = setTimeout(() => push({ q: search || null }), 300);
        return () => clearTimeout(timer);
    }, [search, feed.query.search, push]);

    const hrefFor = React.useCallback(
        (next: number) => {
            const params = new URLSearchParams(searchParams);
            if (next <= 1) params.delete("page");
            else params.set("page", String(next));
            const query = params.toString();
            return query ? `${pathname}?${query}` : pathname;
        },
        [pathname, searchParams],
    );

    function run(
        what: NonNullable<Busy>,
        action: () => Promise<{ ok: boolean; message: string }>,
    ) {
        setBusy(what);
        startSaving(async () => {
            const result = await action();
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            setBusy(null);
        });
    }

    function rowBusy(id: string): RowBusy {
        return busy && busy.kind !== "markAll" && busy.id === id
            ? busy.kind
            : null;
    }

    const filtered =
        feed.query.category !== null ||
        feed.query.status !== "all" ||
        feed.query.search !== "";

    const from = (feed.page - 1) * feed.rows.length;

    return (
        <div className="mx-auto w-full max-w-250">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[32px] leading-none font-bold">
                            {feedCopy.title}
                        </h1>
                        {feed.unread > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[13px] font-semibold text-primary-foreground">
                                {feedCopy.unread(feed.unread)}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {feedLead[audience]}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <Button
                        type="button"
                        loading={busy?.kind === "markAll"}
                        disabled={feed.unread === 0}
                        onClick={() =>
                            run({ kind: "markAll" }, () =>
                                markAllNotificationsRead(audience),
                            )
                        }
                        className="h-10 gap-2 px-4"
                    >
                        <CheckIcon className="size-4" />
                        {feedCopy.markAllRead}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        nativeButton={false}
                        aria-label={feedCopy.settings}
                        className="size-10 bg-card shadow-sm"
                        render={<Link href={feedSettingsHref[audience]} />}
                    >
                        <SettingsIcon className="size-4.5" />
                    </Button>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-60 flex-1">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-subtle-foreground" />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={feedCopy.searchPlaceholder}
                        aria-label={feedCopy.searchPlaceholder}
                        className={cn(
                            CONTROL,
                            "w-full bg-card pl-11 text-[15px] md:text-[15px] dark:bg-card",
                        )}
                    />
                </div>

                <NativeSelect
                    value={feed.query.status}
                    onChange={(event) =>
                        push({
                            status:
                                event.target.value === "all"
                                    ? null
                                    : event.target.value,
                        })
                    }
                    aria-label="Filter by read state"
                    className={cn(
                        "[&_select]:h-12 [&_select]:rounded-xl [&_select]:border-border [&_select]:bg-card! [&_select]:pr-9 [&_select]:pl-4 [&_select]:text-[15px]",
                        "**:data-[slot=native-select-icon]:right-3.5",
                    )}
                >
                    {feedStatuses.map((status) => (
                        <NativeSelectOption
                            key={status.value}
                            value={status.value}
                        >
                            {status.label}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-pressed={view === "grid"}
                    aria-label={
                        view === "list" ? feedCopy.gridView : feedCopy.listView
                    }
                    onClick={() => setView(view === "list" ? "grid" : "list")}
                    className={cn(CONTROL, "size-12 bg-card shadow-sm")}
                >
                    {view === "list" ? (
                        <LayoutGridIcon className="size-4.5" />
                    ) : (
                        <ListIcon className="size-4.5" />
                    )}
                </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5.5 lg:grid-cols-[216px_minmax(0,1fr)]">
                <Card className="h-fit [--card-spacing:--spacing(2.5)] lg:self-start">
                    <div className="flex flex-col gap-1">
                        <p className="px-3.5 pt-1 pb-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                            {feedCopy.categoriesHeading}
                        </p>

                        <CategoryRow
                            label={feedCopy.allTypes}
                            icon={ALL_TYPES_ICON}
                            count={feed.unread}
                            active={feed.query.category === null}
                            disabled={isPending}
                            onSelect={() => push({ cat: null })}
                        />
                        {categories.map((category) => (
                            <CategoryRow
                                key={category.value}
                                label={category.label}
                                icon={category.icon}
                                count={
                                    feed.counts.find(
                                        (entry) =>
                                            entry.value === category.value,
                                    )?.count ?? 0
                                }
                                active={feed.query.category === category.value}
                                disabled={isPending}
                                onSelect={() => push({ cat: category.value })}
                            />
                        ))}
                    </div>
                </Card>

                <div className="min-w-0">
                    {feed.rows.length === 0 ? (
                        <Card className="items-center gap-3 px-6 py-20 text-center ring-border">
                            <p className="text-base font-bold">
                                {filtered
                                    ? feedCopy.filteredEmptyTitle
                                    : feedCopy.emptyTitle}
                            </p>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                {filtered
                                    ? feedCopy.filteredEmptyDescription
                                    : feedEmpty[audience]}
                            </p>
                        </Card>
                    ) : view === "list" ? (
                        <Card className="overflow-hidden [--card-spacing:0px]">
                            <div className="divide-y divide-border-subtle">
                                {feed.rows.map((row) => (
                                    <NotificationRow
                                        key={row.id}
                                        audience={audience}
                                        row={row}
                                        busy={rowBusy(row.id)}
                                        onOpen={(id) =>
                                            run({ kind: "open", id }, () =>
                                                setNotificationRead(
                                                    audience,
                                                    id,
                                                    true,
                                                ),
                                            )
                                        }
                                        onToggleRead={(id, read) =>
                                            run({ kind: "toggle", id }, () =>
                                                setNotificationRead(
                                                    audience,
                                                    id,
                                                    read,
                                                ),
                                            )
                                        }
                                        onResolve={(id, accept) =>
                                            run(
                                                {
                                                    kind: accept
                                                        ? "accept"
                                                        : "decline",
                                                    id,
                                                },
                                                () =>
                                                    resolveNotificationAction(
                                                        audience,
                                                        id,
                                                        accept,
                                                    ),
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-3.5 sm:grid-cols-2">
                            {feed.rows.map((row) => (
                                <NotificationRow
                                    key={row.id}
                                    audience={audience}
                                    row={row}
                                    variant="grid"
                                    busy={rowBusy(row.id)}
                                    onOpen={(id) =>
                                        run({ kind: "open", id }, () =>
                                            setNotificationRead(
                                                audience,
                                                id,
                                                true,
                                            ),
                                        )
                                    }
                                    onToggleRead={(id, read) =>
                                        run({ kind: "toggle", id }, () =>
                                            setNotificationRead(
                                                audience,
                                                id,
                                                read,
                                            ),
                                        )
                                    }
                                    onResolve={(id, accept) =>
                                        run(
                                            {
                                                kind: accept
                                                    ? "accept"
                                                    : "decline",
                                                id,
                                            },
                                            () =>
                                                resolveNotificationAction(
                                                    audience,
                                                    id,
                                                    accept,
                                                ),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}

                    {feed.rows.length > 0 ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-[13px] text-muted-foreground">
                                {feedCopy.showing(
                                    from + feed.rows.length,
                                    feed.total,
                                )}
                            </p>
                            {feed.pageCount > 1 ? (
                                <Pagination className="mx-0 w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={hrefFor(feed.page - 1)}
                                                className={cn(
                                                    "bg-card",
                                                    feed.page <= 1 &&
                                                        "pointer-events-none opacity-50",
                                                )}
                                            />
                                        </PaginationItem>
                                        {Array.from(
                                            { length: feed.pageCount },
                                            (_, index) => index + 1,
                                        ).map((entry) => (
                                            <PaginationItem key={entry}>
                                                <PaginationLink
                                                    href={hrefFor(entry)}
                                                    isActive={
                                                        entry === feed.page
                                                    }
                                                    className={cn(
                                                        entry === feed.page
                                                            ? "border-transparent! bg-primary! text-primary-foreground! hover:bg-primary/80! hover:text-white!"
                                                            : "bg-card",
                                                    )}
                                                >
                                                    {entry}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href={hrefFor(feed.page + 1)}
                                                className={cn(
                                                    "bg-card",
                                                    feed.page >=
                                                        feed.pageCount &&
                                                        "pointer-events-none opacity-50",
                                                )}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function CategoryRow({
    label,
    icon: Icon,
    count,
    active,
    disabled,
    onSelect,
}: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    active: boolean;
    disabled: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            aria-pressed={active}
            className={cn(
                "flex h-10 w-full cursor-pointer items-center gap-3 border-l-2 px-3 text-left text-sm font-medium transition-colors",
                active ? "bg-hover" : "border-transparent hover:bg-hover",
            )}
        >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{label}</span>
            {count > 0 ? (
                <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground tabular-nums">
                    {count}
                </span>
            ) : null}
        </button>
    );
}

export { NotificationsFeed };
