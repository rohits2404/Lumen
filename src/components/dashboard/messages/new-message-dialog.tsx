"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
    listMessageCandidates,
    startConversation,
} from "@/lib/actions/messages";
import {
    messagesHref,
    newMessageCopy,
    type MessageAudience,
} from "@/lib/config/messages";
import type { MessageCandidate } from "@/lib/messages";

function NewMessageDialog({
    audience,
    open,
    onOpenChange,
}: {
    audience: MessageAudience;
    open: boolean;
    onOpenChange: (next: boolean) => void;
}) {
    const copy = newMessageCopy[audience];
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [rows, setRows] = React.useState<MessageCandidate[] | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [busy, setBusy] = React.useState<string | null>(null);
    const [, startOpening] = React.useTransition();

    const [wasOpen, setWasOpen] = React.useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (!open) {
            setSearch("");
            setRows(null);
            setBusy(null);
        }
    }

    React.useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const timer = setTimeout(
            () => {
                if (cancelled) return;
                setLoading(true);
                listMessageCandidates(audience, search)
                    .then((result) => {
                        if (!cancelled) setRows(result);
                    })
                    .catch(() => {
                        if (!cancelled) {
                            setRows([]);
                            toast.add({
                                title: "Couldn't Load That List. Try Again.",
                                type: "error",
                            });
                        }
                    })
                    .finally(() => {
                        if (!cancelled) setLoading(false);
                    });
            },
            search ? 300 : 0,
        );
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [audience, open, search]);

    function choose(candidate: MessageCandidate) {
        const key = `${candidate.userId}:${candidate.courseId}`;
        setBusy(key);
        startOpening(async () => {
            const result = await startConversation(
                audience,
                candidate.userId,
                candidate.courseId,
            );
            setBusy(null);
            if (!result.ok || !result.conversationId) {
                toast.add({ title: result.message, type: "error" });
                return;
            }
            onOpenChange(false);
            router.push(`${messagesHref[audience]}?c=${result.conversationId}`);
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-0 sm:max-w-130">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="text-[20px] font-bold">
                        {copy.title}
                    </DialogTitle>
                    <DialogDescription className="text-[15px]">
                        {copy.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-4">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle-foreground" />
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={copy.search}
                            aria-label={copy.search}
                            className="h-11 rounded-lg bg-background pl-10 text-[15px] md:text-[15px] dark:bg-background"
                        />
                    </div>
                </div>

                <div className="max-h-85 min-h-30 overflow-y-auto border-t border-border">
                    {rows === null || (loading && rows.length === 0) ? (
                        <div className="flex h-30 items-center justify-center">
                            <Spinner className="size-5 text-muted-foreground" />
                        </div>
                    ) : rows.length === 0 ? (
                        <p className="px-6 py-8 text-center text-[14px] text-muted-foreground">
                            {search ? "No matches." : copy.empty}
                        </p>
                    ) : (
                        rows.map((candidate) => {
                            const key = `${candidate.userId}:${candidate.courseId}`;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    disabled={busy !== null}
                                    onClick={() => choose(candidate)}
                                    className="flex w-full cursor-pointer items-center gap-3 border-b border-border-subtle px-6 py-3.5 text-left transition-colors last:border-b-0 hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Avatar className="size-10">
                                        <AvatarImage
                                            src={candidate.image ?? undefined}
                                            alt=""
                                        />
                                        <AvatarFallback className="text-[13px]">
                                            {candidate.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[15px] font-semibold text-foreground">
                                            {candidate.name}
                                        </span>
                                        <span className="block truncate text-[13px] text-muted-foreground">
                                            {candidate.courseTitle}
                                        </span>
                                    </span>
                                    {busy === key ? (
                                        <Spinner className="size-4 shrink-0 text-muted-foreground" />
                                    ) : null}
                                </button>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { NewMessageDialog };
