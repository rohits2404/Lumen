"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_ALL_LIMIT } from "@/lib/config/instructor-students";

function MessageAllDialog({
    open,
    onOpenChange,
    recipients,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipients: number;
    pending: boolean;
    onSubmit: (body: string) => void;
}) {
    const [body, setBody] = React.useState("");

    const [wasOpen, setWasOpen] = React.useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setBody("");
    }

    const reach = Math.min(recipients, MESSAGE_ALL_LIMIT);
    const capped = recipients > MESSAGE_ALL_LIMIT;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-7.5 sm:max-w-134.5">
                <DialogHeader className="gap-2 text-left">
                    <DialogTitle className="text-[20px] font-bold">
                        Message Your Students
                    </DialogTitle>
                    <DialogDescription className="text-[15px]">
                        {recipients === 0
                            ? "No Student Matches The Current Filter."
                            : `This Goes To ${reach} ${
                                  reach === 1 ? "Student" : "Students"
                              } Matching Your Current Filter, In Their Own Conversation About The Course They're Taking.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid gap-2">
                    <Label htmlFor="message-all-body" className="text-[15px]">
                        Message
                    </Label>
                    <Textarea
                        id="message-all-body"
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        rows={6}
                        placeholder="Checking in — how are you getting on with the course?"
                        className="resize-none text-[15px] md:text-[15px] dark:bg-background"
                    />
                    {capped ? (
                        <p className="text-[13px] text-muted-foreground">
                            {recipients} Students Match. This Sends To The First{" "}
                            {reach} — Narrow The Filter To Reach The Rest.
                        </p>
                    ) : null}
                </div>

                <DialogFooter className="mt-7">
                    <Button
                        type="button"
                        loading={pending}
                        disabled={recipients === 0 || body.trim() === ""}
                        onClick={() => onSubmit(body)}
                        className="h-10 px-4"
                    >
                        Send Message
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { MessageAllDialog };
