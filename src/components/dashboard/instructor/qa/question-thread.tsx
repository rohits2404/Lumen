"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChevronUpIcon, SendIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { createQuestionReply, toggleQuestionVote } from "@/lib/actions/qa";
import { userRoleBadge } from "@/lib/config/admin-users";
import { QA_HREF, QA_REPLY_MAX, qaCopy, qaThreadCopy } from "@/lib/config/qa";
import type { QaPerson, QuestionDetail } from "@/lib/qa";
import { cn } from "@/lib/utils";

function QuestionThread({ detail }: { detail: QuestionDetail }) {
    const [, startSaving] = React.useTransition();
    const [busy, setBusy] = React.useState<"vote" | "post" | null>(null);
    const [draft, setDraft] = React.useState("");

    const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
    const stateKey = `${detail.id}:${detail.voted}:${detail.voteCount}`;
    const [lastKey, setLastKey] = React.useState(stateKey);
    if (stateKey !== lastKey) {
        setLastKey(stateKey);
        setOptimistic(null);
    }

    const voted = optimistic ?? detail.voted;
    const voteCount = Math.max(
        0,
        detail.voteCount +
            (optimistic === null
                ? 0
                : optimistic === detail.voted
                  ? 0
                  : optimistic
                    ? 1
                    : -1),
    );

    function run(
        what: "vote" | "post",
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
            if (result.ok && what === "post") setDraft("");
            setBusy(null);
        });
    }

    return (
        <div className="w-full max-w-200">
            <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href={QA_HREF} />}
                className="-ml-2 h-9 gap-2 px-2 text-[14px] text-muted-foreground hover:text-foreground"
            >
                <ArrowLeftIcon className="size-4" />
                {qaThreadCopy.back}
            </Button>

            <Card className="mt-3 gap-0 p-7 ring-border">
                <div className="flex flex-wrap items-center gap-3">
                    {detail.lessonLabel ? (
                        <span className="inline-flex h-6.5 items-center rounded-full bg-hover px-3 text-[13px] text-muted-foreground">
                            {detail.lessonLabel}
                        </span>
                    ) : null}
                    <span className="text-[14px] text-muted-foreground">
                        {qaCopy.replies(detail.replyCount)}
                    </span>
                </div>

                <h1 className="mt-4 text-[24px] leading-snug font-bold text-foreground">
                    {detail.title}
                </h1>

                <div className="mt-3 grid gap-3">
                    {detail.paragraphs.map((paragraph, index) => (
                        <p
                            key={index}
                            className="text-[15px] leading-7 text-muted-foreground"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-border-subtle pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10 shrink-0">
                            <AvatarImage
                                src={detail.author.image ?? undefined}
                                alt=""
                            />
                            <AvatarFallback className="text-[13px]">
                                {detail.author.initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-[15px] font-bold text-foreground">
                                {detail.author.name}
                            </p>
                            <p className="text-[13px] text-muted-foreground">
                                {qaThreadCopy.asked(detail.age)}
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setOptimistic(!voted);
                            run(
                                "vote",
                                () => toggleQuestionVote(detail.id),
                                true,
                            );
                        }}
                        disabled={busy === "vote"}
                        aria-pressed={voted}
                        aria-label={
                            voted
                                ? "Remove your vote"
                                : "Vote for this question"
                        }
                        className="h-10 shrink-0 gap-2 rounded-lg bg-card px-4 text-[15px] font-normal tabular-nums shadow-sm"
                    >
                        {busy === "vote" ? (
                            <Spinner className="size-4" />
                        ) : (
                            <ChevronUpIcon
                                className={cn(
                                    "size-4",
                                    voted && "text-primary",
                                )}
                            />
                        )}
                        {voteCount}
                    </Button>
                </div>
            </Card>

            <h2 className="mt-8 text-[18px] font-bold text-foreground">
                {qaThreadCopy.repliesHeading}
            </h2>

            <div className="mt-4 flex flex-col gap-3.5">
                {detail.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2.5">
                        <Avatar className="size-10 shrink-0">
                            <AvatarImage
                                src={reply.author.image ?? undefined}
                                alt=""
                            />
                            <AvatarFallback className="text-[13px]">
                                {reply.author.initials}
                            </AvatarFallback>
                        </Avatar>
                        <Card
                            className={cn(
                                "min-w-0 flex-1 gap-0 p-4.5 ring-border",
                                reply.fromStaff && "bg-hover",
                            )}
                        >
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-[15px] font-bold text-foreground">
                                    {reply.author.name}
                                </span>
                                <RolePill author={reply.author} />
                                <span className="text-[13px] text-muted-foreground">
                                    · {reply.age}
                                </span>
                            </div>
                            <p className="mt-2 text-[15px] leading-6 text-foreground">
                                {reply.body}
                            </p>
                        </Card>
                    </div>
                ))}

                <form
                    className="flex items-start gap-2.5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!draft.trim()) return;
                        run("post", () =>
                            createQuestionReply(detail.id, draft),
                        );
                    }}
                >
                    <Avatar className="size-10 shrink-0">
                        <AvatarImage
                            src={detail.me.image ?? undefined}
                            alt=""
                        />
                        <AvatarFallback className="text-[13px]">
                            {detail.me.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <Textarea
                            value={draft}
                            maxLength={QA_REPLY_MAX}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder={qaThreadCopy.placeholder}
                            aria-label={qaThreadCopy.placeholder}
                            className="min-h-24 rounded-xl border-border bg-card px-4 py-3 text-[15px] md:text-[15px] dark:bg-card"
                        />
                        <Button
                            type="submit"
                            loading={busy === "post"}
                            className="mt-3 h-10 gap-2 px-5"
                        >
                            <SendIcon className="size-4" />
                            {qaThreadCopy.submit}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RolePill({ author }: { author: QaPerson }) {
    const role = userRoleBadge(author.role);
    return (
        <span
            className={cn(
                "inline-flex h-5.5 items-center rounded-full px-2.5 text-[12px] font-medium",
                role.className,
            )}
        >
            {role.label}
        </span>
    );
}

export { QuestionThread };
