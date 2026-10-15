"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InfoIcon, MegaphoneIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/toast";
import { DiscussionCard } from "@/components/dashboard/discussions/discussion-card";
import { ModerationBanner } from "@/components/dashboard/discussions/moderation-banner";
import { NewDiscussionDialog } from "@/components/dashboard/discussions/new-discussion-dialog";
import {
    createDiscussion,
    setDiscussionPinned,
    toggleDiscussionLike,
    type NewDiscussionInput,
} from "@/lib/actions/discussions";
import {
    DISCUSSIONS_PAGE_SIZE,
    discussionScopes,
    discussionsCopy,
    discussionsLead,
    emptyDiscussions,
    reportedScope,
    instructorActions,
    learnerNote,
    type DiscussionAudience,
    type DiscussionScope,
} from "@/lib/config/discussions";
import type { DiscussionsPage } from "@/lib/discussions";
import { cn } from "@/lib/utils";

type Busy = { kind: "like" | "pin"; id: string } | { kind: "post" } | null;

function DiscussionsBoard({
    audience,
    page,
    children,
}: {
    audience: DiscussionAudience;
    page: DiscussionsPage;
    children?: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = React.useTransition();
    const [, startSaving] = React.useTransition();
    const [busy, setBusy] = React.useState<Busy>(null);
    const [dialog, setDialog] = React.useState<
        { open: false } | { open: true; announce: boolean }
    >({ open: false });

    const instructor = audience === "INSTRUCTOR";

    const [optimistic, setOptimistic] = React.useState<Record<string, boolean>>(
        {},
    );
    const rowKey = page.rows.map((row) => `${row.id}:${row.liked}`).join(",");
    const [lastRowKey, setLastRowKey] = React.useState(rowKey);
    if (rowKey !== lastRowKey) {
        setLastRowKey(rowKey);
        setOptimistic({});
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
        quiet = false,
    ) {
        setBusy(what);
        startSaving(async () => {
            const result = await action();
            if (!result.ok || !quiet) {
                toast.add({
                    title: result.message,
                    type: result.ok ? "success" : "error",
                });
            }
            setBusy(null);
            if (result.ok && what.kind === "post") setDialog({ open: false });
        });
    }

    function like(id: string, liked: boolean) {
        setOptimistic((current) => ({ ...current, [id]: !liked }));
        run(
            { kind: "like", id },
            () => toggleDiscussionLike(audience, id),
            true,
        );
    }

    function post(input: NewDiscussionInput) {
        run({ kind: "post" }, () => createDiscussion(audience, input));
    }

    const from =
        page.total === 0 ? 0 : (page.page - 1) * DISCUSSIONS_PAGE_SIZE + 1;
    const to = from === 0 ? 0 : from + page.rows.length - 1;
    const filtered = page.query.topic !== null || page.query.scope !== "all";
    const empty = emptyDiscussions[audience];

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[32px] leading-none font-bold">
                        {discussionsCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {discussionsLead[audience]}
                    </p>
                </div>

                {instructor ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setDialog({ open: true, announce: true })
                            }
                            className="h-10 gap-2 bg-card px-4 shadow-sm"
                        >
                            <MegaphoneIcon className="size-4" />
                            {instructorActions.announce}
                        </Button>
                        <Button
                            type="button"
                            onClick={() =>
                                setDialog({ open: true, announce: false })
                            }
                            className="h-10 gap-2 px-4"
                        >
                            <PlusIcon className="size-4" />
                            {instructorActions.newDiscussion}
                        </Button>
                    </div>
                ) : (
                    <p className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[14px] text-muted-foreground shadow-sm">
                        <InfoIcon className="size-4" />
                        {learnerNote}
                    </p>
                )}
            </div>

            {instructor && children ? (
                <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    {children}
                </div>
            ) : null}

            {instructor && page.stats && page.stats.needsModeration > 0 ? (
                <ModerationBanner
                    count={page.stats.needsModeration}
                    onReview={() => push({ scope: "reported" })}
                />
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                    <TopicPill
                        active={page.query.topic === null}
                        onClick={() => push({ topic: null })}
                    >
                        {discussionsCopy.allTopics}
                    </TopicPill>
                    {page.topics
                        .filter(
                            (topic) =>
                                topic.threadCount > 0 ||
                                page.query.topic === topic.slug,
                        )
                        .map((topic) => (
                            <TopicPill
                                key={topic.id}
                                active={page.query.topic === topic.slug}
                                onClick={() => push({ topic: topic.slug })}
                            >
                                {topic.name}
                            </TopicPill>
                        ))}
                </div>

                {instructor ? (
                    <div className="ml-auto">
                        <ToggleGroup
                            value={[page.query.scope]}
                            onValueChange={(next: string[]) => {
                                const chosen = next[0] as
                                    DiscussionScope | undefined;
                                if (!chosen || chosen === page.query.scope)
                                    return;
                                push({
                                    scope: chosen === "all" ? null : chosen,
                                });
                            }}
                            aria-label="Filter discussions"
                            className="h-9.25 gap-0 rounded-lg bg-track p-1"
                        >
                            {[
                                ...discussionScopes,
                                ...((page.stats &&
                                    page.stats.needsModeration > 0) ||
                                page.query.scope === "reported"
                                    ? [reportedScope]
                                    : []),
                            ].map((scope) => (
                                <ToggleGroupItem
                                    key={scope.value}
                                    value={scope.value}
                                    className="rounded-md px-3.5 text-[14px] text-muted-foreground aria-pressed:bg-card aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:shadow-sm aria-pressed:hover:bg-card"
                                >
                                    {scope.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                ) : null}
            </div>

            {page.total === 0 ? (
                <Empty className="mt-4 rounded-xl border border-border bg-card py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <InfoIcon />
                        </EmptyMedia>
                        <EmptyTitle>
                            {filtered ? discussionsCopy.noMatches : empty.title}
                        </EmptyTitle>
                        {filtered ? null : (
                            <EmptyDescription>
                                {empty.description}
                            </EmptyDescription>
                        )}
                    </EmptyHeader>
                </Empty>
            ) : (
                <div
                    className={cn(
                        "mt-4 flex flex-col gap-3",
                        isPending && "opacity-60",
                    )}
                >
                    {page.rows.map((row) => {
                        const liked = optimistic[row.id] ?? row.liked;
                        const drift =
                            optimistic[row.id] === undefined
                                ? 0
                                : optimistic[row.id]
                                  ? row.liked
                                      ? 0
                                      : 1
                                  : row.liked
                                    ? -1
                                    : 0;
                        return (
                            <DiscussionCard
                                key={row.id}
                                audience={audience}
                                row={{
                                    ...row,
                                    liked,
                                    likeCount: Math.max(
                                        0,
                                        row.likeCount + drift,
                                    ),
                                }}
                                canModerate={instructor && page.canModerate}
                                busy={
                                    busy &&
                                    busy.kind !== "post" &&
                                    busy.id === row.id
                                        ? busy.kind
                                        : null
                                }
                                onToggleLike={() => like(row.id, liked)}
                                onTogglePin={() =>
                                    run({ kind: "pin", id: row.id }, () =>
                                        setDiscussionPinned(
                                            audience,
                                            row.id,
                                            !row.isPinned,
                                        ),
                                    )
                                }
                            />
                        );
                    })}
                </div>
            )}

            {page.total > 0 ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[13px] text-muted-foreground">
                        {discussionsCopy.showing(from, to, page.total)}
                    </p>
                    <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={hrefFor(page.page - 1)}
                                    aria-disabled={page.page <= 1}
                                    className={cn(
                                        "h-9",
                                        page.page <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: Math.min(page.pageCount, 6) },
                                (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href={hrefFor(i + 1)}
                                            isActive={i + 1 === page.page}
                                            className={cn(
                                                "size-9",
                                                i + 1 === page.page &&
                                                    "bg-primary! text-primary-foreground!",
                                            )}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ),
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    href={hrefFor(page.page + 1)}
                                    aria-disabled={page.page >= page.pageCount}
                                    className={cn(
                                        "h-9",
                                        page.page >= page.pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}

            {instructor ? (
                <NewDiscussionDialog
                    open={dialog.open}
                    onOpenChange={(next) =>
                        setDialog(
                            next
                                ? { open: true, announce: false }
                                : { open: false },
                        )
                    }
                    topics={page.topics}
                    announce={dialog.open ? dialog.announce : false}
                    pending={busy?.kind === "post"}
                    onSubmit={post}
                />
            ) : null}
        </>
    );
}

function TopicPill({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "inline-flex h-8.75 cursor-pointer items-center rounded-full px-4 text-[14px] font-medium transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:bg-hover",
            )}
        >
            {children}
        </button>
    );
}

export { DiscussionsBoard };
