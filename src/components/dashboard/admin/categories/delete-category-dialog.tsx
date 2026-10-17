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
import { deleteCategoryCopy } from "@/lib/config/admin-categories";

function DeleteCategoryDialog({
    open,
    onOpenChange,
    name,
    pending,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    pending: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-110 gap-0 p-7.5 sm:max-w-110">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {deleteCategoryCopy.title}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {deleteCategoryCopy.description(name)}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                    <Button
                        type="button"
                        variant="destructive"
                        loading={pending}
                        onClick={onConfirm}
                        className="h-11 gap-2 px-5"
                    >
                        <Trash2Icon className="size-4" />
                        {deleteCategoryCopy.submit}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { DeleteCategoryDialog };
