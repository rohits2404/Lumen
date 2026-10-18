"use client";

import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { maintenanceToggle } from "@/lib/config/admin-settings";

function MaintenanceDialog({
    open,
    onOpenChange,
    pending,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pending: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-110 gap-0 p-7.5 sm:max-w-110">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-xl font-bold">
                        {maintenanceToggle.confirmTitle}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-6">
                        {maintenanceToggle.confirmDescription}
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
                        <TriangleAlertIcon className="size-4" />
                        {maintenanceToggle.confirmAction}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { MaintenanceDialog };
