"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { setCoursePublished } from "@/lib/actions/instructor-course-manage";
import { publishToggleCopy } from "@/lib/config/instructor-course-manage";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function PublishToggle({
    courseId,
    published,
}: {
    courseId: string;
    published: boolean;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function run(next: boolean) {
        startTransition(async () => {
            const result = await setCoursePublished(courseId, next);
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) {
                setOpen(false);
                router.refresh();
            }
        });
    }

    if (!published) {
        return (
            <Button
                type="button"
                variant="outline"
                loading={pending}
                onClick={() => run(true)}
                className="h-9.5 bg-card px-4 text-[14px]"
            >
                {publishToggleCopy.republish.action}
            </Button>
        );
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
                className="h-9.5 bg-card px-4 text-[14px] text-destructive hover:text-destructive"
            >
                {publishToggleCopy.unpublish.action}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-110 gap-0 p-7.5 sm:max-w-110">
                    <DialogHeader className="gap-2">
                        <DialogTitle className="text-xl font-bold">
                            {publishToggleCopy.unpublish.title}
                        </DialogTitle>
                        <DialogDescription className="text-[15px] leading-6">
                            {publishToggleCopy.unpublish.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6">
                        <Button
                            type="button"
                            variant="destructive"
                            loading={pending}
                            onClick={() => run(false)}
                            className="h-11 px-5"
                        >
                            {publishToggleCopy.unpublish.confirm}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export { PublishToggle };
