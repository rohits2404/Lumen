"use client";

import * as React from "react";
import { CheckIcon, CircleCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { markLessonComplete } from "@/lib/actions/learning";

function LessonCompleteButton({
    lessonId,
    completed,
}: {
    lessonId: string;
    completed: boolean;
}) {
    const [pending, startTransition] = React.useTransition();
    const [done, setDone] = React.useState(completed);

    const [seen, setSeen] = React.useState(completed);
    if (seen !== completed) {
        setSeen(completed);
        setDone(completed);
    }

    function toggle() {
        const next = !done;
        setDone(next);
        startTransition(async () => {
            const result = await markLessonComplete(lessonId, next);
            if (!result.ok) {
                setDone(!next);
                toast.add({
                    title: result.message ?? "Could Not Save.",
                    type: "error",
                });
            }
        });
    }

    return (
        <Button
            type="button"
            variant={done ? "outline" : "default"}
            onClick={toggle}
            loading={pending}
            className={done ? "h-10 gap-2 bg-card" : "h-10 gap-2"}
        >
            {done ? (
                <CircleCheckIcon className="size-4 text-success" />
            ) : (
                <CheckIcon className="size-4" />
            )}
            {done ? "Completed" : "Mark as Complete"}
        </Button>
    );
}

export { LessonCompleteButton };
