"use client";

import * as React from "react";
import { SendHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
    REPORT_NOTE_MAX,
    reportDialogCopy,
    reportReasonOptions,
} from "@/lib/config/instructor-reviews";

function ReportReviewDialog({
    open,
    onOpenChange,
    pending,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pending: boolean;
    onSubmit: (input: { reason: string; note: string }) => void;
}) {
    const [reason, setReason] = React.useState("");
    const [note, setNote] = React.useState("");

    function handleOpenChange(next: boolean) {
        if (!next) {
            setReason("");
            setNote("");
        }
        onOpenChange(next);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-130 gap-0 p-7.5 sm:max-w-130">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {reportDialogCopy.title}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {reportDialogCopy.description}
                    </DialogDescription>
                </DialogHeader>

                <p
                    id="report-reason-heading"
                    className="mt-6 text-[15px] font-semibold"
                >
                    {reportDialogCopy.reasonHeading}
                </p>
                <RadioGroup
                    value={reason}
                    onValueChange={(value: string) => setReason(value)}
                    aria-labelledby="report-reason-heading"
                    className="mt-3 gap-3"
                >
                    {reportReasonOptions.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center gap-3"
                        >
                            <RadioGroupItem
                                id={`report-${option.value}`}
                                value={option.value}
                            />
                            <label
                                htmlFor={`report-${option.value}`}
                                className="cursor-pointer text-[15px]"
                            >
                                {option.label}
                            </label>
                        </div>
                    ))}
                </RadioGroup>

                <label
                    htmlFor="report-review-note"
                    className="mt-6 text-[15px] font-semibold"
                >
                    {reportDialogCopy.noteHeading}
                </label>
                <Textarea
                    id="report-review-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={REPORT_NOTE_MAX}
                    placeholder={reportDialogCopy.notePlaceholder}
                    className="mt-3 min-h-22.5 resize-none bg-background text-[15px] md:text-[15px] dark:bg-background"
                />

                <div className="mt-7">
                    <Button
                        type="button"
                        loading={pending}
                        disabled={reason === ""}
                        onClick={() => onSubmit({ reason, note })}
                        className="h-11 gap-2 px-5"
                    >
                        <SendHorizontalIcon className="size-4" />
                        {reportDialogCopy.submit}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { ReportReviewDialog };
