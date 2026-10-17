"use client";

import * as React from "react";
import { MessageCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    REVIEW_REPLY_MAX,
    replyDialogCopy,
} from "@/lib/config/instructor-reviews";

function ReplyDialog({
    open,
    onOpenChange,
    authorName,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    authorName: string;
    pending: boolean;
    onSubmit: (body: string) => void;
}) {
    const [body, setBody] = React.useState("");

    function handleOpenChange(next: boolean) {
        if (!next) setBody("");
        onOpenChange(next);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-130 gap-0 p-7.5 sm:max-w-130">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {replyDialogCopy.title}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {replyDialogCopy.description(authorName)}
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    maxLength={REVIEW_REPLY_MAX}
                    placeholder={replyDialogCopy.placeholder}
                    aria-label={replyDialogCopy.title}
                    className="mt-6 min-h-27.5 resize-none bg-background text-[15px] md:text-[15px] dark:bg-background"
                />

                <div className="mt-7">
                    <Button
                        type="button"
                        loading={pending}
                        disabled={body.trim() === ""}
                        onClick={() => onSubmit(body)}
                        className="h-11 gap-2 px-5"
                    >
                        <MessageCircleIcon className="size-4" />
                        {replyDialogCopy.submit}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { ReplyDialog };
