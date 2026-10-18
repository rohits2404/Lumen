"use client";

import * as React from "react";
import { SendHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    changeReasonOptions,
    NOTE_MAX_LENGTH,
    requestChangesCopy,
} from "@/lib/config/admin-courses";

function RequestChangesDialog({
    open,
    onOpenChange,
    courseTitle,
    instructorName,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseTitle: string;
    instructorName: string;
    pending: boolean;
    onSubmit: (input: { reasons: string[]; note: string }) => void;
}) {
    const [reasons, setReasons] = React.useState<string[]>([]);
    const [note, setNote] = React.useState("");

    function handleOpenChange(next: boolean) {
        if (!next) {
            setReasons([]);
            setNote("");
        }
        onOpenChange(next);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-130 gap-0 p-7.5 sm:max-w-130">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {requestChangesCopy.title}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {requestChangesCopy.description(
                            courseTitle,
                            instructorName,
                        )}
                    </DialogDescription>
                </DialogHeader>

                <p className="mt-6 text-[15px] font-semibold">
                    {requestChangesCopy.reasonsHeading}
                </p>
                <div className="mt-3 flex flex-col gap-3">
                    {changeReasonOptions.map((option) => (
                        <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-3 text-[15px]"
                        >
                            <Checkbox
                                checked={reasons.includes(option.value)}
                                onCheckedChange={(checked) =>
                                    setReasons((current) =>
                                        checked === true
                                            ? [...current, option.value]
                                            : current.filter(
                                                  (entry) =>
                                                      entry !== option.value,
                                              ),
                                    )
                                }
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <label
                    htmlFor="request-changes-note"
                    className="mt-6 text-[15px] font-semibold"
                >
                    {requestChangesCopy.noteHeading}
                </label>
                <Textarea
                    id="request-changes-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={NOTE_MAX_LENGTH}
                    placeholder={requestChangesCopy.notePlaceholder}
                    className="mt-3 min-h-22.5 resize-none bg-background text-[15px] md:text-[15px] dark:bg-background"
                />

                <div className="mt-7">
                    <Button
                        type="button"
                        loading={pending}
                        onClick={() => onSubmit({ reasons, note })}
                        className="h-11 gap-2 px-5"
                    >
                        <SendHorizontalIcon className="size-4" />
                        {requestChangesCopy.submit}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { RequestChangesDialog };
