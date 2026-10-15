"use client";

import * as React from "react";
import { StarIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const RATING_LABELS = [
    "Poor",
    "Fair",
    "Good",
    "Very Good",
    "Excellent",
] as const;

function CourseFeedbackDialog({
    open,
    onOpenChange,
    courseTitle,
    instructorFirstName,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseTitle: string;
    instructorFirstName: string;
}) {
    const [rating, setRating] = React.useState(0);
    const [hovered, setHovered] = React.useState(0);

    const shown = hovered || rating;

    function close(open: boolean) {
        onOpenChange(open);
        if (!open) {
            setRating(0);
            setHovered(0);
        }
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent
                showCloseButton={false}
                className="w-full max-w-[calc(100%-2rem)] gap-0 rounded-2xl p-8 text-center sm:max-w-129.5"
            >
                <DialogClose className="absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
                    <XIcon className="size-5" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                <span className="mx-auto flex size-15 items-center justify-center rounded-2xl bg-star/15 text-star">
                    <StarIcon className="size-7" />
                </span>

                <DialogTitle className="mt-6 font-sans text-2xl leading-tight font-bold">
                    How Is The Course Going?
                </DialogTitle>

                <DialogDescription className="mx-auto mt-2.5 max-w-100 text-[17px] leading-7 text-muted-foreground">
                    You Have Started {courseTitle} — Your Rating Helps Other
                    Learners Decide, And Helps {instructorFirstName} Improve The
                    Course.
                </DialogDescription>

                <div
                    className="mt-7 flex items-center justify-center gap-4"
                    onMouseLeave={() => setHovered(0)}
                >
                    {RATING_LABELS.map((label, index) => {
                        const value = index + 1;
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHovered(value)}
                                onFocus={() => setHovered(value)}
                                onBlur={() => setHovered(0)}
                                aria-pressed={rating === value}
                                className="cursor-pointer rounded-sm transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                                <StarIcon
                                    className={cn(
                                        "size-9",
                                        value <= shown
                                            ? "fill-star text-star"
                                            : "fill-track text-track",
                                    )}
                                />
                                <span className="sr-only">
                                    {value} {value === 1 ? "star" : "stars"} —{" "}
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {rating > 0 ? (
                    <Button
                        onClick={() => {
                            toast.add({
                                title: `Thanks — you rated ${courseTitle} ${rating} ${rating === 1 ? "star" : "stars"}.`,
                                type: "success",
                            });
                            close(false);
                        }}
                        className="mx-auto mt-7 h-12 px-8 font-semibold"
                    >
                        Submit Rating
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={() => close(false)}
                        className="mx-auto mt-7 h-12 bg-card px-8 font-semibold shadow-sm"
                    >
                        Maybe Later
                    </Button>
                )}

                <p className="mt-4 text-sm text-subtle-foreground">
                    You Can Update Your Review Any Time From My Learning.
                </p>
            </DialogContent>
        </Dialog>
    );
}

export { CourseFeedbackDialog };
