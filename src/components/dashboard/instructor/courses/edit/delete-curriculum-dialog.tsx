"use client";

import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { deleteCurriculumCopy } from "@/lib/config/course-editor";

export type DeleteTarget =
    | { kind: "section"; sectionId: string; title: string; lessons: number }
    | { kind: "lesson"; sectionId: string; lessonId: string; title: string };

function DeleteCurriculumDialog({
    target,
    onOpenChange,
    onConfirm,
}: {
    target: DeleteTarget | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    const copy =
        target?.kind === "section"
            ? {
                  ...deleteCurriculumCopy.section,
                  description: deleteCurriculumCopy.section.description(
                      target.title,
                      target.lessons,
                  ),
              }
            : {
                  ...deleteCurriculumCopy.lesson,
                  description: deleteCurriculumCopy.lesson.description(
                      target?.title ?? "",
                  ),
              };

    return (
        <Dialog open={target !== null} onOpenChange={onOpenChange}>
            <DialogContent className="w-110 gap-0 p-7.5 sm:max-w-110">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {copy.title}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {copy.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        className="h-11 gap-2 px-5"
                    >
                        <Trash2Icon className="size-4" />
                        {copy.submit}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { DeleteCurriculumDialog };
