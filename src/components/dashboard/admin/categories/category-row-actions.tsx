"use client";

import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCategoriesCopy } from "@/lib/config/admin-categories";

function CategoryRowActions({
    name,
    courseCount,
    childCount,
    pending,
    onEdit,
    onDelete,
}: {
    name: string;
    courseCount: number;
    childCount: number;
    pending: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const blockedReason =
        childCount > 0
            ? adminCategoriesCopy.deleteBlockedByChildren(childCount)
            : courseCount > 0
              ? adminCategoriesCopy.deleteBlockedByCourses(courseCount)
              : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Actions for ${name}`}
                className="grid size-8.5 shrink-0 cursor-pointer place-items-center rounded-lg border border-border bg-card text-subtle-foreground transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-hover aria-expanded:text-foreground"
            >
                <EllipsisIcon className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                    disabled={pending}
                    onClick={onEdit}
                    className="cursor-pointer p-2"
                >
                    <PencilIcon />
                    {adminCategoriesCopy.edit}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {blockedReason ? (
                    <DropdownMenuItem
                        disabled
                        title={blockedReason}
                        className="p-2"
                    >
                        <Trash2Icon />
                        {adminCategoriesCopy.delete}
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        disabled={pending}
                        onClick={onDelete}
                        className="cursor-pointer p-2 text-destructive [&_svg]:text-destructive"
                    >
                        <Trash2Icon />
                        {adminCategoriesCopy.delete}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { CategoryRowActions };
