"use client";

import * as React from "react";
import { PaperclipIcon, SendHorizontalIcon } from "lucide-react";

import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
    closedThreadReason,
    counterpartRole,
    MESSAGE_MAX,
    messagesCopy,
    type MessageAudience,
} from "@/lib/config/messages";
import { markConversationRead, sendMessage } from "@/lib/actions/messages";
import type { ActiveThread } from "@/lib/messages";
import { cn } from "@/lib/utils";

const BUBBLE_MAX = "max-w-[560px]";

type Pending = { id: string; body: string };

function MessageThread({
    audience,
    thread,
    unread,
}: {
    audience: MessageAudience;
    thread: ActiveThread;
    unread: number;
}) {
    const [isSending, startSending] = React.useTransition();
    const [, startReading] = React.useTransition();
    const [draft, setDraft] = React.useState("");
    const [pending, setPending] = React.useState<Pending[]>([]);
    const viewport = React.useRef<HTMLDivElement>(null);
    const readFor = React.useRef<string | null>(null);

    const serverIds = `${thread.id}:${thread.messages
        .map((message) => message.id)
        .join(",")}`;
    const [lastServerIds, setLastServerIds] = React.useState(serverIds);
    if (serverIds !== lastServerIds) {
        setLastServerIds(serverIds);
        setPending([]);
    }

    React.useEffect(() => {
        if (unread === 0 || readFor.current === thread.id) return;
        readFor.current = thread.id;
        startReading(async () => {
            await markConversationRead(audience, thread.id);
        });
    }, [audience, thread.id, unread]);

    React.useEffect(() => {
        const node = viewport.current;
        if (node) node.scrollTop = node.scrollHeight;
    }, [thread.id, serverIds, pending.length]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const body = draft.trim();
        if (!body || !thread.writable) return;

        const local: Pending = { id: `pending-${Date.now()}`, body };
        setDraft("");
        setPending((current) => [...current, local]);

        startSending(async () => {
            const result = await sendMessage(audience, thread.id, body);
            if (!result.ok) {
                setPending((current) =>
                    current.filter((entry) => entry.id !== local.id),
                );
                setDraft(body);
                toast.add({ title: result.message, type: "error" });
            }
        });
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex h-17 shrink-0 items-center gap-3 border-b border-border px-5">
                <Avatar size="lg">
                    <AvatarImage
                        src={thread.counterpart.image ?? undefined}
                        alt=""
                    />
                    <AvatarFallback className="text-[13px]">
                        {thread.counterpart.initials}
                    </AvatarFallback>
                    {thread.counterpart.online ? (
                        <AvatarBadge
                            title={messagesCopy.presence}
                            className="bg-success ring-card group-data-[size=lg]/avatar:size-2"
                        />
                    ) : null}
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-[16px] font-semibold text-foreground">
                        {thread.counterpart.name}
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">
                        {counterpartRole[audience]}
                        {thread.courseTitle ? ` · ${thread.courseTitle}` : ""}
                    </p>
                </div>
            </div>

            <div
                ref={viewport}
                className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto bg-background p-5.5"
            >
                {thread.messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            BUBBLE_MAX,
                            "w-fit rounded-xl px-4 py-3",
                            message.mine
                                ? "self-end bg-primary text-primary-foreground"
                                : "self-start border border-border bg-card",
                        )}
                    >
                        <p className="text-[15px] leading-normal wrap-break-word whitespace-pre-wrap">
                            {message.body}
                        </p>
                        <p
                            className={cn(
                                "mt-1 text-right text-[12px]",
                                message.mine
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground",
                            )}
                        >
                            {message.time}
                        </p>
                    </div>
                ))}

                {pending.map((entry) => (
                    <div
                        key={entry.id}
                        className={cn(
                            BUBBLE_MAX,
                            "w-fit self-end rounded-xl bg-primary px-4 py-3 text-primary-foreground opacity-70",
                        )}
                    >
                        <p className="text-[15px] leading-normal wrap-break-word whitespace-pre-wrap">
                            {entry.body}
                        </p>
                        <p className="mt-1 text-right text-[12px] text-primary-foreground/70">
                            Sending…
                        </p>
                    </div>
                ))}
            </div>

            <form
                onSubmit={submit}
                className="flex h-18 shrink-0 items-center gap-2.75 border-t border-border px-4.5"
            >
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled
                    title={messagesCopy.attach}
                    aria-label={messagesCopy.attach}
                    className="size-10 shrink-0 rounded-lg bg-card"
                >
                    <PaperclipIcon className="size-4.5" />
                </Button>

                <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={MESSAGE_MAX}
                    disabled={!thread.writable}
                    placeholder={
                        thread.writable
                            ? messagesCopy.composerPlaceholder
                            : closedThreadReason[audience]
                    }
                    aria-label={messagesCopy.composerPlaceholder}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 text-[14px] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <Button
                    type="submit"
                    size="icon"
                    loading={isSending}
                    disabled={!thread.writable}
                    aria-label={messagesCopy.send}
                    className="size-11 shrink-0 rounded-lg"
                >
                    <SendHorizontalIcon className="size-4.5" />
                </Button>
            </form>
        </div>
    );
}

export { MessageThread };
