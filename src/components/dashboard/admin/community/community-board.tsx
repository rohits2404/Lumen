"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
    EllipsisIcon,
    MessagesSquareIcon,
    PencilIcon,
    PlusIcon,
    ShieldCheckIcon,
    Trash2Icon,
    UsersRoundIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ModeratorsDialog } from "@/components/dashboard/admin/community/moderators-dialog";
import {
    TopicDialog,
    type TopicDialogValues,
} from "@/components/dashboard/admin/community/topic-dialog";
import {
    createTopic,
    deleteTopic,
    saveTopicModerators,
    updateTopic,
    type ModeratorDraft,
    type TopicInput,
} from "@/lib/actions/admin-community";
import {
    categoryAccent,
    categoryAccentClasses,
} from "@/lib/config/admin-categories";
import {
    adminCommunityCopy,
    MODERATORS_PAGE_SIZE,
    permissionSummary,
    postingPill,
    topicVisibilityLabels,
} from "@/lib/config/admin-community";
import { userRoleBadge } from "@/lib/config/admin-users";
import type { ModeratorRow, TopicRow } from "@/lib/admin/community";
import { initialsOf } from "@/lib/user";
import { cn } from "@/lib/utils";

const counts = new Intl.NumberFormat("en-US");

function CommunityBoard({
    topics,
    moderators,
    page,
    pageCount,
    total,
    children,
}: {
    topics: TopicRow[];
    moderators: ModeratorRow[];
    page: number;
    pageCount: number;
    total: number;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [saving, startSaving] = React.useTransition();

    const [topicDialog, setTopicDialog] = React.useState<{
        mode: "create" | "edit";
        topic: TopicRow | null;
    } | null>(null);
    const [moderatorDialog, setModeratorDialog] = React.useState<{
        topic: TopicRow;
        focusUserId: string | null;
    } | null>(null);

    const hrefFor = React.useCallback(
        (next: number) => {
            const params = new URLSearchParams(searchParams);
            if (next <= 1) params.delete("page");
            else params.set("page", String(next));
            const search = params.toString();
            return search ? `${pathname}?${search}` : pathname;
        },
        [pathname, searchParams],
    );

    function run(
        action: () => Promise<{ ok: boolean; message: string }>,
        onDone?: () => void,
    ) {
        startSaving(async () => {
            const result = await action();
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) onDone?.();
        });
    }

    function submitTopic(input: TopicInput) {
        const target = topicDialog;
        if (!target) return;
        run(
            () =>
                target.mode === "edit" && target.topic
                    ? updateTopic(target.topic.id, input)
                    : createTopic(input),
            () => setTopicDialog(null),
        );
    }

    function submitModerators(drafts: ModeratorDraft[]) {
        const target = moderatorDialog;
        if (!target) return;
        run(
            () => saveTopicModerators(target.topic.id, drafts),
            () => setModeratorDialog(null),
        );
    }

    function scopeOf(row: ModeratorRow) {
        if (topics.length > 0 && row.topics.length === topics.length) {
            return "All topics";
        }
        const names = row.topics.map((topic) => topic.name);
        if (names.length <= 2) return names.join(" · ");
        return `${names.slice(0, 2).join(" · ")} +${names.length - 2} more`;
    }

    const from = (page - 1) * MODERATORS_PAGE_SIZE + 1;

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[32px] leading-none font-bold">
                        {adminCommunityCopy.title}
                    </h1>
                    <p className="mt-2.5 text-[15px] text-muted-foreground">
                        {adminCommunityCopy.description}
                    </p>
                </div>
                <Button
                    onClick={() =>
                        setTopicDialog({ mode: "create", topic: null })
                    }
                    className="h-10 gap-2 px-4"
                >
                    <PlusIcon className="size-4" />
                    {adminCommunityCopy.newTopic}
                </Button>
            </div>

            <div className="mt-5">{children}</div>

            <h2 className="mt-7 text-lg font-bold">
                {adminCommunityCopy.topicsHeading}
            </h2>

            {topics.length === 0 ? (
                <Card className="mt-3 items-center gap-3 px-6 py-16 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminCommunityCopy.topicsEmptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminCommunityCopy.topicsEmptyDescription}
                    </p>
                </Card>
            ) : (
                <div
                    className={cn(
                        "mt-3 flex flex-col gap-3.5",
                        saving &&
                            "pointer-events-none opacity-60 transition-opacity",
                    )}
                >
                    {topics.map((topic) => {
                        const accent =
                            categoryAccentClasses[
                                categoryAccent(topic.accentColor)
                            ];
                        const pill = postingPill(topic.learnersCanStartThreads);
                        const blocked = topic.threadCount > 0;

                        return (
                            <Card
                                key={topic.id}
                                className="ring-border [--card-spacing:0px]"
                            >
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4.5 py-4">
                                    <div
                                        className={cn(
                                            "grid size-10.5 shrink-0 place-items-center rounded-xl",
                                            accent.tile,
                                        )}
                                    >
                                        <MessagesSquareIcon
                                            aria-hidden
                                            className={cn(
                                                "size-5",
                                                accent.icon,
                                            )}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h3 className="truncate text-lg leading-5 font-bold">
                                                {topic.name}
                                            </h3>
                                            <span
                                                className={cn(
                                                    "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium",
                                                    pill.className,
                                                )}
                                            >
                                                {pill.label}
                                            </span>
                                        </div>
                                        {topic.description ? (
                                            <p className="mt-0.5 truncate text-[15px] leading-5 text-muted-foreground">
                                                {topic.description}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-5">
                                        <span className="text-[15px] text-muted-foreground tabular-nums">
                                            {counts.format(topic.threadCount)}{" "}
                                            threads
                                        </span>
                                        <span className="text-[15px] text-muted-foreground tabular-nums">
                                            {counts.format(topic.postCount)}{" "}
                                            posts
                                        </span>
                                        <span className="flex items-center gap-2 text-[15px] text-muted-foreground">
                                            <ShieldCheckIcon
                                                aria-hidden
                                                className="size-4"
                                            />
                                            {topic.moderatorCount === 0
                                                ? "No moderators"
                                                : `${topic.moderatorCount} moderator${
                                                      topic.moderatorCount === 1
                                                          ? ""
                                                          : "s"
                                                  }`}
                                        </span>
                                        <span className="inline-flex rounded-full bg-hover px-2.5 py-1 text-[13px] font-medium text-muted-foreground">
                                            {
                                                topicVisibilityLabels[
                                                    topic.visibility
                                                ]
                                            }
                                        </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2.5">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setModeratorDialog({
                                                    topic,
                                                    focusUserId: null,
                                                })
                                            }
                                            className="h-9 bg-card px-4 shadow-sm"
                                        >
                                            {
                                                adminCommunityCopy.manageModerators
                                            }
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                aria-label={adminCommunityCopy.rowMenu.label(
                                                    topic.name,
                                                )}
                                                className="grid size-9 cursor-pointer place-items-center rounded-lg border border-border bg-card text-subtle-foreground shadow-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                                            >
                                                <EllipsisIcon className="size-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-56"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setTopicDialog({
                                                            mode: "edit",
                                                            topic,
                                                        })
                                                    }
                                                    className="cursor-pointer p-2"
                                                >
                                                    <PencilIcon />
                                                    {
                                                        adminCommunityCopy
                                                            .rowMenu.edit
                                                    }
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setModeratorDialog({
                                                            topic,
                                                            focusUserId: null,
                                                        })
                                                    }
                                                    className="cursor-pointer p-2"
                                                >
                                                    <UsersRoundIcon />
                                                    {
                                                        adminCommunityCopy
                                                            .rowMenu.moderators
                                                    }
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    disabled={blocked}
                                                    title={
                                                        blocked
                                                            ? adminCommunityCopy.rowMenu.deleteBlocked(
                                                                  topic.threadCount,
                                                              )
                                                            : undefined
                                                    }
                                                    onClick={() =>
                                                        run(() =>
                                                            deleteTopic(
                                                                topic.id,
                                                            ),
                                                        )
                                                    }
                                                    className={cn(
                                                        "p-2",
                                                        !blocked &&
                                                            "cursor-pointer text-destructive [&_svg]:text-destructive",
                                                    )}
                                                >
                                                    <Trash2Icon />
                                                    {
                                                        adminCommunityCopy
                                                            .rowMenu.delete
                                                    }
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <h2 className="mt-7 text-lg font-bold">
                {adminCommunityCopy.moderatorsHeading}
            </h2>
            <p className="mt-0.5 text-[15px] text-muted-foreground">
                {adminCommunityCopy.moderatorsLead}
            </p>

            {moderators.length === 0 ? (
                <Card className="mt-3 items-center gap-3 px-6 py-16 text-center ring-border">
                    <p className="text-base font-bold">
                        {adminCommunityCopy.moderatorsEmptyTitle}
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {adminCommunityCopy.moderatorsEmptyDescription}
                    </p>
                </Card>
            ) : (
                <Card className="mt-3 overflow-hidden ring-border [--card-spacing:0px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="h-10.5 px-5 text-[13px] font-medium text-muted-foreground">
                                    Member
                                </TableHead>
                                <TableHead className="h-10.5 px-5 text-[13px] font-medium text-muted-foreground">
                                    Role
                                </TableHead>
                                <TableHead className="h-10.5 px-5 text-[13px] font-medium text-muted-foreground">
                                    Scope
                                </TableHead>
                                <TableHead className="h-10.5 px-5 text-[13px] font-medium text-muted-foreground">
                                    Permissions
                                </TableHead>
                                <TableHead className="h-10.5 px-5" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moderators.map((row) => {
                                const role = userRoleBadge(row.role);
                                return (
                                    <TableRow
                                        key={row.userId}
                                        className="border-border-subtle hover:bg-transparent"
                                    >
                                        <TableCell className="h-15 px-5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage
                                                        src={
                                                            row.image ??
                                                            undefined
                                                        }
                                                        alt=""
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <AvatarFallback className="bg-hover text-[11px] font-semibold text-foreground">
                                                        {initialsOf(
                                                            row.name,
                                                            row.email,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate text-[15px] font-semibold">
                                                    {row.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="h-15 px-5">
                                            <span
                                                className={cn(
                                                    "inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-medium",
                                                    role.className,
                                                )}
                                            >
                                                {role.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="h-15 px-5 text-[15px] text-muted-foreground">
                                            {scopeOf(row)}
                                        </TableCell>
                                        <TableCell className="h-15 px-5 text-[15px] text-muted-foreground">
                                            {permissionSummary(row)}
                                        </TableCell>
                                        <TableCell className="h-15 px-5 text-right">
                                            {row.topics.length === 1 ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        const topic =
                                                            topics.find(
                                                                (entry) =>
                                                                    entry.id ===
                                                                    row
                                                                        .topics[0]!
                                                                        .id,
                                                            );
                                                        if (topic) {
                                                            setModeratorDialog({
                                                                topic,
                                                                focusUserId:
                                                                    row.userId,
                                                            });
                                                        }
                                                    }}
                                                    className="h-8 bg-card px-3.5 shadow-sm"
                                                >
                                                    {adminCommunityCopy.edit}
                                                </Button>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="outline"
                                                                className="h-8 bg-card px-3.5 shadow-sm"
                                                            />
                                                        }
                                                    >
                                                        {
                                                            adminCommunityCopy.edit
                                                        }
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-56"
                                                    >
                                                        {row.topics.map(
                                                            (entry) => (
                                                                <DropdownMenuItem
                                                                    key={
                                                                        entry.id
                                                                    }
                                                                    onClick={() => {
                                                                        const topic =
                                                                            topics.find(
                                                                                (
                                                                                    candidate,
                                                                                ) =>
                                                                                    candidate.id ===
                                                                                    entry.id,
                                                                            );
                                                                        if (
                                                                            topic
                                                                        ) {
                                                                            setModeratorDialog(
                                                                                {
                                                                                    topic,
                                                                                    focusUserId:
                                                                                        row.userId,
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer p-2"
                                                                >
                                                                    {entry.name}
                                                                </DropdownMenuItem>
                                                            ),
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {pageCount > 1 ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[13px] text-muted-foreground">
                        {adminCommunityCopy.showing(
                            from,
                            from + moderators.length - 1,
                            total,
                        )}
                    </p>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={hrefFor(page - 1)}
                                    className={cn(
                                        "bg-card",
                                        page <= 1 &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: pageCount },
                                (_, index) => index + 1,
                            ).map((entry) => (
                                <PaginationItem key={entry}>
                                    <PaginationLink
                                        href={hrefFor(entry)}
                                        isActive={entry === page}
                                        className={cn(
                                            entry === page
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
                                    href={hrefFor(page + 1)}
                                    className={cn(
                                        "bg-card",
                                        page >= pageCount &&
                                            "pointer-events-none opacity-50",
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}

            <TopicDialog
                open={topicDialog !== null}
                onOpenChange={(next) => {
                    if (!next) setTopicDialog(null);
                }}
                mode={topicDialog?.mode ?? "create"}
                targetId={topicDialog?.topic?.id}
                values={
                    topicDialog?.topic
                        ? ({
                              name: topicDialog.topic.name,
                              description: topicDialog.topic.description ?? "",
                              accentColor: topicDialog.topic.accentColor,
                              visibility: topicDialog.topic.visibility,
                              learnersCanStartThreads:
                                  topicDialog.topic.learnersCanStartThreads,
                              requiresModeratorApproval:
                                  topicDialog.topic.requiresModeratorApproval,
                          } satisfies TopicDialogValues)
                        : null
                }
                pending={saving}
                onSubmit={submitTopic}
            />

            <ModeratorsDialog
                open={moderatorDialog !== null}
                onOpenChange={(next) => {
                    if (!next) setModeratorDialog(null);
                }}
                topicId={moderatorDialog?.topic.id ?? null}
                topicName={moderatorDialog?.topic.name ?? ""}
                focusUserId={moderatorDialog?.focusUserId ?? null}
                pending={saving}
                onSubmit={submitModerators}
            />
        </>
    );
}

export { CommunityBoard };
