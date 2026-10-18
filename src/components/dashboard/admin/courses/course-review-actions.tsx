"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { RequestChangesDialog } from "@/components/dashboard/admin/courses/request-changes-dialog";
import {
    approveCourse,
    rejectCourse,
    requestCourseChanges,
} from "@/lib/actions/admin-courses";
import { courseViewCopy } from "@/lib/config/admin-courses";

function CourseReviewActions({
    courseId,
    courseTitle,
    instructorName,
}: {
    courseId: string;
    courseTitle: string;
    instructorName: string;
}) {
    const router = useRouter();
    const [pending, startTransition] = React.useTransition();
    const [requesting, setRequesting] = React.useState(false);
    const [decision, setDecision] = React.useState<
        "approve" | "changes" | "reject" | null
    >(null);

    function run(
        which: "approve" | "changes" | "reject",
        action: () => Promise<{ ok: boolean; message: string }>,
    ) {
        setDecision(which);
        startTransition(async () => {
            const result = await action();
            toast.add({
                title: result.message,
                type: result.ok ? "success" : "error",
            });
            if (result.ok) {
                setRequesting(false);
                router.refresh();
            }
            setDecision(null);
        });
    }

    return (
        <>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Button
                    loading={decision === "approve"}
                    disabled={pending}
                    onClick={() =>
                        run("approve", () => approveCourse(courseId))
                    }
                    className="h-11 gap-2 px-5"
                >
                    <CheckIcon className="size-4" />
                    {courseViewCopy.approve}
                </Button>

                <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() => setRequesting(true)}
                    className="h-11 bg-card px-5 shadow-sm"
                >
                    {courseViewCopy.requestChanges}
                </Button>

                <Button
                    variant="ghost"
                    loading={decision === "reject"}
                    disabled={pending}
                    onClick={() => run("reject", () => rejectCourse(courseId))}
                    className="h-11 px-5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    {courseViewCopy.reject}
                </Button>
            </div>

            <RequestChangesDialog
                open={requesting}
                onOpenChange={setRequesting}
                courseTitle={courseTitle}
                instructorName={instructorName}
                pending={pending}
                onSubmit={(input) =>
                    run("changes", () => requestCourseChanges(courseId, input))
                }
            />
        </>
    );
}

export { CourseReviewActions };
